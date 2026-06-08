import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { buildNatsOptions } from '@carlosdiazz/lottodiz-shared/dist/node';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('OBS_MAIN');
  console.log(envs);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: buildNatsOptions(envs),
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      // Remueve todo lo que no está incluído en los DTOs
      //TODO whitelist: true,
      // Retorna bad request si hay propiedades en el objeto no requeridas
      //TODO forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new RpcException({
          status: 400,
          message: errors
            .map((err) => Object.values(err.constraints ?? ''))
            .join(', '),
        }),
    }),
  );

  //app.useGlobalFilters(new RpcAllExceptionsFilter());

  await app.listen();
  logger.debug(`👍Server up👍💪👍💪👍💪`);
}

void bootstrap().catch(handleError);

function handleError(error: unknown) {
  console.error(error);
  process.exit(1);
}

process.on('uncaughtException', handleError);
