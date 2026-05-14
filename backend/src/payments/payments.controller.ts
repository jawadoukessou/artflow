import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}
  @Get() findAll(@TenantId() cid: string, @Query() q: any) { return this.service.findAll(cid, q); }
  @Post() create(@TenantId() cid: string, @Body() dto: any) { return this.service.create(cid, dto); }
}
