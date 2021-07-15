import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { Logger, UseInterceptors } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Server } from 'ws';
import { OwnerService } from './owner.service';
import { RedisPropagatorInterceptor } from '../shared/redis-propagator/redis-propagator.interceptor';
import { RedisPropagatorService } from '../shared/redis-propagator/redis-propagator.service';
import { SocketStateService } from '../shared/socket-state/socket-state.service';

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: ['http://localhost:3420', 'http://localhost:3400'] }
})
export class OwnerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private service: OwnerService,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
  ) { }

  @SubscribeMessage('msgToServer')
  public async handleMessage(client: Socket, payload: any) {
    const owner = await this.service.create(payload);
    return { event: 'msgToClient', data: owner };
  };

  @SubscribeMessage('joinRoom')
  public async joinRoom(client: Socket, uuid: string) {
    const userJwt = client.handshake.headers['authorization'];
    client.join(uuid);
    client.emit('joinedRoom', uuid);
    this.logger.log(`Client JOIN: ${client.id} - with ${userJwt} - room ${uuid}`);
    const owner = await this.service.getMessagesActive(uuid);
    return { event: 'msgToClient', data: owner };
  };

  @SubscribeMessage('leaveRoom')
  public async leaveRoom(client: Socket, room: string): Promise<void> {
    const userJwt = client.handshake.headers['authorization'];
    this.logger.log(`Client: ${client.id} - with ${userJwt}`);
    client.leave(room);
    client.emit('leftRoomServer', room);
  }

  public afterInit(server: Server): void {
    this.redisPropagatorService.injectSocketServer(server);
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const userJwt = client.handshake.headers['authorization'];
    //await this.redis.remove(userJwt, client.id);
    this.socketStateService.remove(userJwt, client);

    client.removeAllListeners('disconnect');
    return this.logger.log(`Client disconnected: ${client.id} - with ${userJwt}`);
  }

  public async handleConnection(client: Socket): Promise<void> {
    const idUser = client.handshake.headers['authorization'];
    this.socketStateService.add(idUser, client);
    //await this.redis.register(idUser, client.id);
    return this.logger.log(`Client connected: ${client.id} - with ${idUser}`);
  }
}
