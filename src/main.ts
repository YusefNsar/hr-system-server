import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // create the nest app
  const app = await NestFactory.create(AppModule);

  // setup global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // set global prefix
  app.setGlobalPrefix('api');

  // setup swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HR System')
    .setDescription('The API description of HR System backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // get server port
  const configService = app.get(ConfigService);
  const port = configService.get('port');

  await app.listen(port);
}
bootstrap();
