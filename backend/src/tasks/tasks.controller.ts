import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId, CurrentUser } from '../common/decorators/public.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private service: TasksService) {}
  @Get() findAll(@TenantId() cid: string, @Query() q: any) { return this.service.findAll(cid, q); }
  @Post() create(@TenantId() cid: string, @CurrentUser() u: any, @Body() dto: any) { return this.service.create(cid, u.id, dto); }
  @Patch(':id') update(@TenantId() cid: string, @Param('id') id: string, @Body() dto: any) { return this.service.update(cid, id, dto); }
}
