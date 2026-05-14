import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

export interface RequiredPermission {
  action: string;
  subject: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    // Admin role bypasses all permission checks
    if (user.role?.name === 'admin') return true;

    const userPerms: { action: string; subject: string }[] = user.role?.permissions || [];

    const hasPermission = required.every((req) =>
      userPerms.some(
        (p) =>
          (p.action === req.action || p.action === 'manage') &&
          (p.subject === req.subject || p.subject === 'all'),
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions: ${required.map((r) => `${r.action}:${r.subject}`).join(', ')}`);
    }
    return true;
  }
}
