import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ErpService } from './erp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('ERP')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('erp')
export class ErpController {
  constructor(private service: ErpService) {}
  @Get('connections') getConnections(@TenantId() cid: string) { return this.service.getConnections(cid); }
  @Post('connections') createConnection(@TenantId() cid: string, @Body() dto: any) { return this.service.createConnection(cid, dto); }
  @Post('connections/:id/sync') syncNow(@TenantId() cid: string, @Param('id') id: string) { return this.service.syncNow(cid, id); }
  @Get('connections/:id/logs') getLogs(@TenantId() cid: string, @Param('id') id: string) { return this.service.getLogs(cid, id); }
}
