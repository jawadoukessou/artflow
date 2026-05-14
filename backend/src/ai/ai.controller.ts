import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('AI')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private service: AiService) {}
  @Get('predictions') getPredictions(@TenantId() cid: string) { return this.service.getPredictions(cid); }
  @Post('generate-email') generateEmail(@Body() body: any) {
    return { email: this.service.generateEmail(body.customerName, body.invoiceNumber, body.amount, body.daysOverdue) };
  }
}
