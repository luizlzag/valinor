import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/kanban',
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  broadcast(event: string, data: unknown) {
    this.server?.emit(event, data);
  }
}