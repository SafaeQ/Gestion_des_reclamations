import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { TeamsModule } from './teams/teams.module';
import { EntitiesModule } from './entities/entities.module';

@Module({
  imports: [UsersModule, ComplaintsModule, TeamsModule, EntitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
