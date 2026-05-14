import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Disputes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private service: DisputesService) {}
  @Get() findAll(@TenantId() cid: string, @Query() q: any) { return this.service.findAll(cid, q); }
  @Post() create(@TenantId() cid: string, @Body() dto: any) { return this.service.create(cid, dto); }
  @Patch(':id') update(@TenantId() cid: string, @Param('id') id: string, @Body() dto: any) { return this.service.update(cid, id, dto); }
}
