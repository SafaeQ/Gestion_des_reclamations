import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { User } from 'entities/user';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode';
import { USER_STATUS } from 'helpers/enums';
import { ComplaintService } from 'complaints/complaints.service';
//setting up socket io
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  private readonly onlineUsers = new Map<string, boolean>();
  constructor(
    private readonly complaintService: ComplaintService,
    @InjectRepository(User) private user: Repository<User>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const cookies = new Cookies(client.handshake.headers.cookie);
    const supportToken = cookies.get('support_access_token');

    if (supportToken) {
      const decoded: any = jwt_decode(supportToken);
      if (decoded) {
        await this.user.update(decoded.userId, {
          activity: USER_STATUS.OFFLINE,
        });
        return;
      }
    }

    const prodToken = cookies.get('prod_access_token');
    if (prodToken) {
      const decoded: any = jwt_decode(prodToken);
      if (decoded) {
        console.log('decoded offline', decoded.userId);
        await this.user.update(decoded.userId, {
          activity: USER_STATUS.OFFLINE,
        });
        return;
      }
    }
  }

  @SubscribeMessage('user-away')
  async userAway(
    @MessageBody() data: { userId: number; activity: USER_STATUS },
  ) {
    console.log('Client connected away:', data);
    await this.user.update(data.userId, { activity: data.activity });
  }

  /* A socket event that is triggered when a client connects. */
  @SubscribeMessage('user-online')
  async userOnline(
    @MessageBody()
    data: {
      userId: number;
      activity: USER_STATUS;
      type: string;
    },
  ) {
    const user = await this.user.findOne({
      where: { id: data.userId },
    });
    if (data.activity === USER_STATUS.AWAY) {
      console.log('Client connected:', data);
      await this.user.update(data.userId, { activity: USER_STATUS.AWAY });
      return;
    }

    if (user.activity === USER_STATUS.AWAY && data.type === 'click') {
      console.log('Client connected:', data);
      await this.user.update(data.userId, { activity: data.activity });
    } else if (user.activity !== USER_STATUS.AWAY) {
      await this.user.update(data.userId, { activity: data.activity });
    }
  }

  @SubscribeMessage('complainAdminsSeen')
  async complainTech(
    @MessageBody() data: { complaintId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const complaint = await this.complaintService.findOne(data.complaintId);

    if (complaint) {
      client.broadcast.emit(
        `complainSeen-prod-${complaint.user.id}-${complaint.id}`,
        complaint,
      );
    }
    if (complaint) {
      client.broadcast.emit(
        `complainSeen-tech-${complaint.user.id}-${complaint.id}`,
        complaint,
      );
    }
  }

  @SubscribeMessage('complainCreatedByUser')
  async complainCreated(
    @MessageBody() complaintId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const complaint = await this.complaintService.findOne(complaintId);
    if (complaint) {
      complaint && client.broadcast.emit(`complainCreated`, complaint);
    }
  }
}
