import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Risk')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('risk')
export class RiskController {
  constructor(private service: RiskService) {}
  @Get() findAll(@TenantId() cid: string, @Query() q: any) { return this.service.findAll(cid, q); }
  @Post('compute/:customerId') compute(@Param('customerId') id: string) { return this.service.computeScore(id); }
}
