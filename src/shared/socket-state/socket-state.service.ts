import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, Socket[]>();

  public remove(userId: string, socket: Socket): boolean {
    console.log(`Socket state remove user: ${userId}`);
    const existingSockets = this.socketState.get(userId);

    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter(s => s.id !== socket.id);

    if (!sockets.length) {
      this.socketState.delete(userId);
    } else {
      this.socketState.set(userId, sockets);
    }

    return true;
  }

  public add(userId: string, socket: Socket): boolean {
    console.log(`Socket state add user: ${userId}`);
    const existingSockets = this.socketState.get(userId) || [];

    const sockets = [...existingSockets, socket];
    console.log(`sockets actuales: ${sockets.length}`);
    this.socketState.set(userId, sockets);

    return true;
  }

  public get(userId: string): Socket[] {
    console.log(`Socket state get user: ${userId}`);
    const sockets = this.socketState.get(userId) || []
    console.log(`sockets actuales: ${sockets.length}`);
    return sockets;
  }

  public getAll(): Socket[] {
    const all = [];

    this.socketState.forEach(sockets => all.push(sockets));

    return all;
  }
}
