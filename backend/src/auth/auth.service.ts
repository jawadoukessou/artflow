import {
  Injectable, BadRequestException, UnauthorizedException,
  ConflictException, NotFoundException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: { include: { permissions: true } }, company: true },
    });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');
    if (!user.company.isActive) throw new UnauthorizedException('Company account is suspended');

    // MFA check
    if (user.isMfaEnabled) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, userId: user.id };
      }
      const valid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: dto.mfaCode,
        window: 2,
      });
      if (!valid) throw new UnauthorizedException('Invalid MFA code');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async register(dto: RegisterDto) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already in use');

    // Check slug uniqueness
    const slug = dto.companySlug || dto.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existingCompany = await this.prisma.company.findUnique({ where: { slug } });
    if (existingCompany) throw new ConflictException('Company slug already taken');

    // Get/create admin role
    let adminRole = await this.prisma.role.findUnique({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: {
          name: 'admin',
          description: 'Full system access',
          permissions: { create: [{ action: 'manage', subject: 'all' }] },
        },
      });
    }

    // Create company + user in transaction
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: dto.companyName, slug, currency: 'EUR', timezone: 'Europe/Paris' },
      });
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          companyId: company.id,
          roleId: adminRole.id,
        },
        include: { role: { include: { permissions: true } }, company: true },
      });
      return user;
    });

    const tokens = await this.generateTokens(result);
    return { user: this.sanitizeUser(result), ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const stored = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: { include: { role: { include: { permissions: true } }, company: true } } },
      });
      if (!stored || stored.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }
      // Rotate token
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      return this.generateTokens(stored.user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { message: 'Logged out successfully' };
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = speakeasy.generateSecret({ name: `ArFlow:${user.email}`, issuer: 'ArFlow' });
    await this.prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret.base32 } });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCode };
  }

  async enableMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaSecret) throw new BadRequestException('MFA not set up');

    const valid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });
    if (!valid) throw new BadRequestException('Invalid MFA code');

    await this.prisma.user.update({ where: { id: userId }, data: { isMfaEnabled: true } });
    return { message: 'MFA enabled successfully' };
  }

  async disableMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isMfaEnabled) throw new BadRequestException('MFA not enabled');

    const valid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });
    if (!valid) throw new BadRequestException('Invalid MFA code');

    await this.prisma.user.update({ where: { id: userId }, data: { isMfaEnabled: false, mfaSecret: null } });
    return { message: 'MFA disabled' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } }, company: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, companyId: user.companyId, role: user.role?.name };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private sanitizeUser(user: any) {
    const { password, mfaSecret, ...safe } = user;
    return safe;
  }
}
