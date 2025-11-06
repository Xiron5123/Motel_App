import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  // Tạo booking request (RENTER only)
  async createBooking(renterId: string, dto: CreateBookingDto) {
    // Kiểm tra listing có tồn tại và AVAILABLE không
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { landlord: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing không tồn tại');
    }

    if (listing.status !== 'AVAILABLE') {
      throw new BadRequestException('Listing không khả dụng');
    }

    // Không cho landlord tự book listing của mình
    if (listing.landlordId === renterId) {
      throw new BadRequestException('Không thể đặt phòng của chính mình');
    }

    // Kiểm tra đã có booking PENDING cho listing này chưa
    const existingPending = await this.prisma.bookingRequest.findFirst({
      where: {
        renterId,
        listingId: dto.listingId,
        status: BookingStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException('Đã có yêu cầu đang chờ duyệt');
    }

    const booking = await this.prisma.bookingRequest.create({
      data: {
        renterId,
        listingId: dto.listingId,
        note: dto.note,
        status: BookingStatus.PENDING,
      },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            landlord: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // Gửi notification cho landlord
    await this.notificationsService.createNotification(
      booking.listing.landlord.id,
      NotificationType.BOOKING_CREATED,
      {
        bookingId: booking.id,
        listingId: booking.listingId,
        listingTitle: booking.listing.title,
        message: `${booking.renter.name} đã gửi yêu cầu đặt phòng`,
      },
    );

    // Gửi realtime notification
    this.eventsGateway.sendNotificationToUser(
      booking.listing.landlord.id,
      'booking_created',
      {
        bookingId: booking.id,
        listing: {
          id: booking.listing.id,
          title: booking.listing.title,
        },
        renter: {
          id: booking.renter.id,
          name: booking.renter.name,
        },
      },
    );

    return booking;
  }

  // Lấy danh sách bookings theo role
  async getBookings(userId: string, userRole: Role) {
    const where =
      userRole === Role.LANDLORD
        ? {
            // Landlord xem bookings cho listings của mình
            listing: {
              landlordId: userId,
            },
          }
        : {
            // Renter xem bookings mình đã tạo
            renterId: userId,
          };

    return this.prisma.bookingRequest.findMany({
      where,
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            landlord: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Lấy chi tiết booking
  async getBookingById(bookingId: string, userId: string, userRole: Role) {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
            landlord: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    // Kiểm tra quyền truy cập
    const isOwner =
      booking.renterId === userId ||
      booking.listing.landlordId === userId;

    if (!isOwner) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    return booking;
  }

  // Cập nhật status (state machine)
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    userRole: Role,
    dto: UpdateBookingStatusDto,
  ) {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        renter: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    // Validate state transitions
    this.validateStatusTransition(
      booking,
      dto.status,
      userId,
      userRole,
    );

    // Cập nhật status
    const updated = await this.prisma.bookingRequest.update({
      where: { id: bookingId },
      data: { status: dto.status },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            landlord: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // Gửi notification dựa trên status
    await this.sendStatusNotification(updated);

    return updated;
  }

  // Validate state machine transitions
  private validateStatusTransition(
    booking: any,
    newStatus: BookingStatus,
    userId: string,
    userRole: Role,
  ) {
    const currentStatus = booking.status;

    // Chỉ landlord mới có thể ACCEPT/REJECT
    if (
      (newStatus === BookingStatus.ACCEPTED ||
        newStatus === BookingStatus.REJECTED) &&
      (userRole !== Role.LANDLORD ||
        booking.listing.landlordId !== userId)
    ) {
      throw new ForbiddenException(
        'Chỉ landlord mới có thể accept/reject',
      );
    }

    // Chỉ renter mới có thể CANCEL
    if (
      newStatus === BookingStatus.CANCELLED &&
      booking.renterId !== userId
    ) {
      throw new ForbiddenException(
        'Chỉ renter mới có thể cancel',
      );
    }

    // Validate transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [
        BookingStatus.ACCEPTED,
        BookingStatus.REJECTED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.ACCEPTED]: [],
      [BookingStatus.REJECTED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${currentStatus} sang ${newStatus}`,
      );
    }
  }

  // Helper: Gửi notification khi status thay đổi
  private async sendStatusNotification(booking: any) {
    let notificationType: NotificationType;
    let message: string;
    let recipientId: string;
    let eventName: string;

    switch (booking.status) {
      case BookingStatus.ACCEPTED:
        recipientId = booking.renterId;
        notificationType = NotificationType.BOOKING_ACCEPTED;
        message = `Đơn đặt phòng "${booking.listing.title}" đã được chấp nhận`;
        eventName = 'booking_accepted';
        break;
      case BookingStatus.REJECTED:
        recipientId = booking.renterId;
        notificationType = NotificationType.BOOKING_REJECTED;
        message = `Đơn đặt phòng "${booking.listing.title}" đã bị từ chối`;
        eventName = 'booking_rejected';
        break;
      case BookingStatus.CANCELLED:
        recipientId = booking.listing.landlordId;
        notificationType = NotificationType.BOOKING_CANCELLED;
        message = `${booking.renter.name} đã hủy đơn đặt phòng "${booking.listing.title}"`;
        eventName = 'booking_cancelled';
        break;
      default:
        return;
    }

    // Tạo notification record
    await this.notificationsService.createNotification(
      recipientId,
      notificationType,
      {
        bookingId: booking.id,
        listingId: booking.listing.id,
        listingTitle: booking.listing.title,
        message,
      },
    );

    // Gửi realtime
    this.eventsGateway.sendNotificationToUser(recipientId, eventName, {
      bookingId: booking.id,
      status: booking.status,
      listing: {
        id: booking.listing.id,
        title: booking.listing.title,
      },
      message,
    });
  }
}
