import { NAME_NATS_SERVICE } from '@carlosdiazz/lottodiz-shared';
import { buildNatsOptions } from '@carlosdiazz/lottodiz-shared/dist/node';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

//Propio
import { envs } from '../../config';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: NAME_NATS_SERVICE,
        transport: Transport.NATS,
        options: buildNatsOptions(envs, { timeout: 60000 }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
