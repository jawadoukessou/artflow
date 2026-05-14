import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Collections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}
}
