import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Invoices')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get() findAll(@TenantId() cid: string, @Query() q: any) { return this.service.findAll(cid, q); }
  @Get(':id') findOne(@TenantId() cid: string, @Param('id') id: string) { return this.service.findOne(cid, id); }
  @Post() create(@TenantId() cid: string, @Body() dto: any) { return this.service.create(cid, dto); }
  @Patch(':id') update(@TenantId() cid: string, @Param('id') id: string, @Body() dto: any) { return this.service.update(cid, id, dto); }
  @Post(':id/remind') remind(@TenantId() cid: string, @Param('id') id: string) { return this.service.sendReminder(cid, id); }
}
