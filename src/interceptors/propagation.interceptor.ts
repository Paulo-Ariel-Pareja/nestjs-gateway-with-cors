import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
@Injectable()
export class PropagationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): any {
    const socket = context.switchToWs().getClient();
    if(!socket.handshake.headers['authorization']) {
      return new BadRequestException('Not authorizated')
    }
    return next.handle()
  }
}