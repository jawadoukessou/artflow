import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}
  @Get('roles') getRoles() { return this.service.getRoles(); }
  @Get('audit-logs') getAuditLogs(@TenantId() cid: string, @Query() q: any) { return this.service.getAuditLogs(cid, q); }
  @Get('stats') getStats(@TenantId() cid: string) { return this.service.getCompanyStats(cid); }
}
