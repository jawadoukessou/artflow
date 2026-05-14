import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: { id:true, email:true, firstName:true, lastName:true, isActive:true, lastLoginAt:true, role:true, createdAt:true },
    });
  }

  async create(companyId: string, dto: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');
    const role = await this.prisma.role.findUnique({ where: { name: dto.role || 'collector' } });
    const hashedPassword = await bcrypt.hash(dto.password || 'ArFlow2026!', 12);
    return this.prisma.user.create({
      data: { ...dto, companyId, password: hashedPassword, roleId: role?.id },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }
}
