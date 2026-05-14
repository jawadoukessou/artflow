import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get main dashboard KPIs' })
  getDashboard(@TenantId() companyId: string) {
    return this.analyticsService.getDashboardKpis(companyId);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Aging balance report' })
  getAging(@TenantId() companyId: string) {
    return this.analyticsService.getAgingReport(companyId);
  }

  @Get('collectors')
  @ApiOperation({ summary: 'Collector performance metrics' })
  getCollectors(@TenantId() companyId: string) {
    return this.analyticsService.getCollectorPerformance(companyId);
  }

  @Get('dso-trend')
  @ApiOperation({ summary: 'DSO evolution over time' })
  getDsoTrend(@TenantId() companyId: string, @Query('months') months?: number) {
    return this.analyticsService.getDsoTrend(companyId, months || 12);
  }

  @Get('cash-forecast')
  @ApiOperation({ summary: 'Payment forecast for next N days' })
  getCashForecast(@TenantId() companyId: string, @Query('days') days?: number) {
    return this.analyticsService.getCashForecast(companyId, days || 60);
  }

  @Get('risky-customers')
  @ApiOperation({ summary: 'Top risky customers' })
  getRiskyCustomers(@TenantId() companyId: string) {
    return this.analyticsService.getTopRiskyCustomers(companyId);
  }
}
