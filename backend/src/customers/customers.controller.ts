import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilterDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, TenantId } from '../common/decorators/public.decorator';

@ApiTags('Customers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers with filters, sorting, pagination' })
  findAll(@TenantId() companyId: string, @Query() query: CustomerFilterDto) {
    return this.customersService.findAll(companyId, query);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get aging balance buckets across all customers' })
  getAging(@TenantId() companyId: string) {
    return this.customersService.getAging(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer 360 profile' })
  findOne(@TenantId() companyId: string, @Param('id') id: string) {
    return this.customersService.findOne(companyId, id);
  }

  @Get(':id/aging')
  @ApiOperation({ summary: 'Get aging balance for specific customer' })
  getCustomerAging(@TenantId() companyId: string, @Param('id') id: string) {
    return this.customersService.getAging(companyId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new customer' })
  create(@TenantId() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(companyId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  update(@TenantId() companyId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete customer' })
  delete(@TenantId() companyId: string, @Param('id') id: string) {
    return this.customersService.delete(companyId, id);
  }
}
