import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/public.decorator';

@ApiTags('Workflows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private service: WorkflowsService) {}
  @Get() findAll(@TenantId() cid: string) { return this.service.findAll(cid); }
  @Post() create(@TenantId() cid: string, @Body() dto: any) { return this.service.create(cid, dto); }
  @Patch(':id/toggle') toggle(@Param('id') id: string) { return this.service.toggle(id); }
}
