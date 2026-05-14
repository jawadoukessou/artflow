import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Audit write operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          // In production, emit event to audit log queue
          // this.eventEmitter.emit('audit.log', { method, url, userId: user?.id });
        }
      }),
    );
  }
}
