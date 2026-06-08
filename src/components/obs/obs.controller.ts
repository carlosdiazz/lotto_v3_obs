import { Controller } from '@nestjs/common';

import { ObsService } from './obs.service';
import {
  MethodValid,
  ObsControllerInterface,
  ResponseInterface,
} from '@carlosdiazz/lottodiz-shared';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { envs } from 'src/config';

@Controller()
export class ObsController implements ObsControllerInterface {
  constructor(private readonly obsService: ObsService) {}
  public async verify_obs(): Promise<ResponseInterface> {
    return await this.obsService.verify_obs();
  }

  @MessagePattern(`${MethodValid.OBS_EXECUTE_ACTION}/${envs.CHANNEL_ID}`)
  public async execute_action(
    @Payload() id: number,
  ): Promise<ResponseInterface> {
    return await this.obsService.execute_action(id);
  }
}
