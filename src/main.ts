import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { join } from "path";

import { AppModule } from './app.module';
import { initAdapters } from './adapters/redis-io.adapter';
//import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //app.useWebSocketAdapter(new RedisIoAdapter(app));
  //initAdapters(app);
  const options = new DocumentBuilder()
    .setTitle('Task example')
    .setDescription('The task API description')
    .setVersion('1.0')
    .addTag('task')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('swagger', app, document);

  const configService = app.get(ConfigService);
  const appPort = configService.get('appConfig.port');
  app.useStaticAssets(join(__dirname, '..', 'resource'));
  await app.listen(appPort);
  console.log(`Service running port ${appPort}`);
  Logger.log(
    `service running at port ${appPort}`,
    'notifications-socket',
  );
}
bootstrap();
