import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { RedisModule } from 'nestjs-ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OwnerModule } from './owner/owner.module';
import { SharedModule } from './shared/shared.module';

import appConfig from './config/app.config';
import dbConfig from './config/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('dbConfig.uri'),
      }),
      inject: [ConfigService],
    }),
    OwnerModule,
    RedisModule.forRoot([
      {
        name: 'REDIS_SUBSCRIBER_CLIENT',
        host: '127.0.0.1',
        port: 7001,
        password: '',
      },
      {
        name: 'REDIS_PUBLISHER_CLIENT',
        host: '127.0.0.1',
        port: 7001,
        password: ''
      }
    ]),
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule { }
