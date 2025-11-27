import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoommateDto } from './dto/create-roommate.dto';
import { UpdateRoommateDto } from './dto/update-roommate.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoommatesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateRoommateDto) {
        return this.prisma.roommateProfile.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RoommateProfileWhereUniqueInput;
        where?: Prisma.RoommateProfileWhereInput;
        orderBy?: Prisma.RoommateProfileOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.roommateProfile.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const profile = await this.prisma.roommateProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!profile) {
            throw new NotFoundException(`Roommate profile with ID ${id} not found`);
        }

        return profile;
    }

    async findMyProfile(userId: string) {
        return this.prisma.roommateProfile.findUnique({
            where: { userId },
        });
    }

    async update(userId: string, dto: UpdateRoommateDto) {
        // Check if profile exists
        const profile = await this.prisma.roommateProfile.findUnique({
            where: { userId },
        });

        if (profile) {
            return this.prisma.roommateProfile.update({
                where: { userId },
                data: dto,
            });
        } else {
            // Create if not exists (upsert logic handled by frontend calling create/update appropriately, but here we can support upsert or just create)
            // For strict update, throw error. But let's allow create via update if needed or handle in controller.
            // Actually, let's stick to update logic.
            throw new NotFoundException('Profile not found');
        }
    }

    async upsert(userId: string, dto: CreateRoommateDto) {
        return this.prisma.roommateProfile.upsert({
            where: { userId },
            update: dto,
            create: {
                ...dto,
                userId,
            },
        });
    }

    async findByUserId(userId: string) {
        const profile = await this.prisma.roommateProfile.findUnique({
            where: { userId },
        });
        return profile;
    }

    async remove(userId: string) {
        return this.prisma.roommateProfile.delete({
            where: { userId },
        });
    }
}
