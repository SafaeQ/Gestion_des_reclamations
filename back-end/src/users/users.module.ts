import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from 'entities/departements';
import { User } from 'entities/user';
import { AuthUserController } from './auth.controller';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Departement]),
    ScheduleModule.forRoot(),
  ],
  controllers: [UserController, AuthUserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
