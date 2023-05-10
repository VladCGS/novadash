import { SocketAdapter } from '@app/common/helpers/socket-adapter.helper';
import { AdvancedLoggerService } from '@app/common/modules/advanced-logger/services/advanced-logger.service';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqService } from '@app/common/modules/rmq/rmq.service';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { startMoralisSetup } from '../../../libs/common/moralis.starter';
import { AlphapingModule } from './alphaping.module';

const bootstrap = async () => {
  await startMoralisSetup();

  const app = await NestFactory.create(AlphapingModule, {
    cors: true,
  });

  await ConfigModule.envVariablesLoaded;

  // Validator initialization
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // Api documentation config
  const config = new DocumentBuilder()
    .setTitle('Nest + Orm')
    .setDescription('The nest js API description')
    .setVersion('1.0')
    .addTag('nest')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  app.useWebSocketAdapter(new SocketAdapter(app));

  app.use(
    session({
      cookie: {
        maxAge: 60000 * 60 * 24,
      },
      secret: process.env.SECRET_COOKIE,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const rmqService = app.get<RmqService>(RmqService);

  await app.init();
  app.connectMicroservice(rmqService.getOptions(RMQ_SERVICES_NAMES.ALPHAPING));
  await app.startAllMicroservices();

  await app.listen(+process.env.PORT || 5000);
};
bootstrap();
