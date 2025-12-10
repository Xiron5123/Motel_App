import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(
    userId: string,
    dto: { reason: string; reportedUserId?: string; messageId?: string },
  ) {
    return this.prisma.report.create({
      data: {
        reporterId: userId,
        reason: dto.reason,
        reportedUserId: dto.reportedUserId,
        messageId: dto.messageId,
      },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        message: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    return this.prisma.report.update({
      where: { id },
      data: { status },
    });
  }
}
