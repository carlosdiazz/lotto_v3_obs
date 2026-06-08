import { Module } from '@nestjs/common';
import { NatsModule, ObsModule } from '../components';

@Module({
  imports: [NatsModule, ObsModule],
})
export class AppModule {}
