import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ReportStatus } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo vi phạm' })
  createReport(
    @GetUser('id') userId: string,
    @Body()
    dto: {
      reason: string;
      reportedUserId?: string;
      messageId?: string;
    },
  ) {
    return this.reportsService.createReport(userId, dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo (Admin)' })
  getAllReports() {
    return this.reportsService.getAllReports();
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái báo cáo (Admin)' })
  updateReportStatus(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.reportsService.updateReportStatus(id, status);
  }
}
