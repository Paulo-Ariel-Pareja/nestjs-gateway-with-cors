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
import { PropagationInterceptor } from '../interceptors/propagation.interceptor';

@UseInterceptors(PropagationInterceptor)
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: ['http://localhost:3420', 'http://localhost:4200'] } 
})
export class OwnerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('MessageGateway');

  constructor(
    private service: OwnerService,
  ) { }

  @SubscribeMessage('msgToServer')
  public async handleMessage(client: Socket, payload: any) {
    const userJwt = client.handshake.headers['authorization'];
    const owner = await this.service.create(payload);
    client.broadcast.to(userJwt).emit('msgToClient', owner);
    return client.emit('msgToClient', owner);
  };

  @SubscribeMessage('joinRoom')
  public async joinRoom(client: Socket, uuid: string) {
    const userJwt = client.handshake.headers['authorization'];
    client.join(uuid);
    client.emit('joinedRoom', uuid);
    this.logger.log(`Client JOIN: ${client.id} - with ${userJwt} - room ${uuid}`);
    const owner = await this.service.getMessagesActive(uuid);
    if (owner) {
      return client.emit('msgToClient', owner);
    }
  };

  @SubscribeMessage('leaveRoom')
  public async leaveRoom(client: Socket, room: string): Promise<void> {
    const userJwt = client.handshake.headers['authorization'];
    this.logger.log(`Client LEAVE: ${client.id} - with ${userJwt}`);
    client.leave(room);
    client.emit('leftRoomServer', room);
  }

  public afterInit(server: Server): void {
    return this.logger.log('---   Init gateway   ---');
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const userJwt = client.handshake.headers['authorization'];
    return this.logger.log(`Client disconnected: ${client.id} - with ${userJwt}`);
  }

  public async handleConnection(client: Socket): Promise<void> {
    const idUser = client.handshake.headers['authorization'];
    return this.logger.log(`Client connected: ${client.id} - with ${idUser}`);
  }
}
