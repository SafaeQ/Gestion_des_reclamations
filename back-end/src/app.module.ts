import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartementsModule } from 'departements/departements.module';
import { EventsModule } from 'events/events.module';
import { UsersService } from 'users/users.service';
import { EntityModule } from 'users_entities/entities.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ComplaintsModule } from 'complaints/complaints.module';
import { TeamsModule } from 'teams/teams.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // loading environment variables
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // initiating typeorm module according to the docs
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/entities/*.js'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    //loading application modules to understand check nestjs docs https://docs.nestjs.com/
    EntityModule,
    TeamsModule,
    UserModule,
    EventsModule,
    DepartementsModule,
    ComplaintsModule,
    // ToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  // on init create a super user for the application
  onModuleInit() {
    console.log(`Initialization...`);
    this.usersService.createSuperAdmin().then(() => {
      console.log(`Admin User Initialized`);
    });
  }
}
