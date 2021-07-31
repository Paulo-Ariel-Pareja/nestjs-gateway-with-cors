import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Server } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { SocketStateService } from '../socket-state/socket-state.service';


import { RedisSocketEventEmitDTO } from './dto/socket-event-emit.dto';
import { RedisSocketEventSendDTO } from './dto/socket-event-send.dto';

const REDIS_SOCKET_EVENT_SEND_NAME = 'REDIS_SOCKET_EVENT_SEND_NAME';
const REDIS_SOCKET_EVENT_EMIT_ALL_NAME = 'REDIS_SOCKET_EVENT_EMIT_ALL_NAME';
const REDIS_SOCKET_EVENT_EMIT_SAME_NAME = 'REDIS_SOCKET_EVENT_EMIT_SAME_NAME';

@Injectable()
export class RedisPropagatorService {
  private socketServer: Server;

  public constructor(
    private readonly socketStateService: SocketStateService,
    private readonly redisService: RedisService,
  ) {
    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_SEND_NAME)
      .pipe(tap(this.consumeSendEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_ALL_NAME)
      .pipe(tap(this.consumeEmitToAllEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_SAME_NAME)
      .pipe(tap(this.consumeSendEventForSameUser))
      .subscribe();
  }

  public injectSocketServer(server: Server): RedisPropagatorService {
    this.socketServer = server;

    return this;
  }

  private consumeSendEvent = (eventInfo: RedisSocketEventSendDTO): void => {
    const { userId, event, data, socketId } = eventInfo;

    return this.socketStateService
      .get(userId)
      .filter((socket) => socket.id !== socketId)
      .forEach((socket) => socket.emit(event, data));
  };

  private consumeSendEventForSameUser = (eventInfo: RedisSocketEventSendDTO): void => {
    const { userId, event, data } = eventInfo;

    return this.socketStateService
      .get(userId)
      .forEach((socket) => socket.emit(event, data));
  };

  private consumeEmitToAllEvent = (
    eventInfo: RedisSocketEventEmitDTO,
  ): void => {
    this.socketServer.emit(eventInfo.event, eventInfo.data);
  };

  // envia a todos los usuarios con mismo id menos al que emite
  public propagateEvent(eventInfo: RedisSocketEventSendDTO): boolean {
    this.redisService.publish(
      REDIS_SOCKET_EVENT_SEND_NAME,
      eventInfo
    );
    return true;
  }

  // envia a todos los usuarios con mismo id INCLUYENDO al que emite
  public emitToAllSocketForUser(eventInfo: RedisSocketEventSendDTO): boolean {
    this.redisService.publish(
      REDIS_SOCKET_EVENT_EMIT_SAME_NAME,
      eventInfo,
    );
    return true;
  }

  // notifica a todos los sockets
  public emitToAll(eventInfo: RedisSocketEventEmitDTO): boolean {
    this.redisService.publish(
      REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
      eventInfo
    );
    return true;
  }

  /*   private consumeEmitToAuthenticatedEvent = (
    eventInfo: RedisSocketEventEmitDTO,
  ): void => {
    const { event, data } = eventInfo;

    return this.socketStateService
      .getAll()
      .forEach((socket) => socket.emit(event, data));
  }; */
}
