import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entities/user';
import { EventsGateway } from './events.gateway';
import { ComplaintService } from 'complaints/complaints.service';
import { Complaint } from 'entities/complaint';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Complaint
    ]),
  ],
  providers: [
    EventsGateway,
    ComplaintService,
  ],
})
export class EventsModule {}
