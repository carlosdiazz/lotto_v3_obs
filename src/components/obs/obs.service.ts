import {
  ConfigObsInterface,
  exectFunction,
  MethodValid,
  MethodValidObs,
  NAME_NATS_SERVICE,
  ObsServiceInterface,
} from '@carlosdiazz/lottodiz-shared';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import OBSWebSocket from 'obs-websocket-js';
import { firstValueFrom, timeout } from 'rxjs';

import { ResponsePropio } from '../../common';
import { envs } from '../../config';

@Injectable()
export class ObsService implements ObsServiceInterface, OnModuleInit {
  private obs: OBSWebSocket;
  private readonly logger = new Logger(ObsService.name);

  constructor(
    @Inject(NAME_NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  public async onModuleInit() {
    this.handleLog('onModuleInit', {});
    this.obs = new OBSWebSocket();
    await this.connect_obs();
  }

  private async connect_obs() {
    try {
      const { OBS_IP, OBS_PASSWORD, OBS_PORT } = envs;
      await this.obs.connect(`ws://${OBS_IP}:${OBS_PORT}/${OBS_PASSWORD}`);
      this.logger.debug('✅ Connect OBS WebSocket');
    } catch (err) {
      this.handleError('onModuleInit', err);
    }
  }

  public async startStream(key: string): Promise<void> {
    this.handleLog('startStream', key);
    try {
      await this.obs.call('SetStreamServiceSettings', {
        streamServiceType: 'rtmp_common',
        streamServiceSettings: {
          server: 'rtmp://a.rtmp.youtube.com/live2',
          key: key,
          //use_auth: false,
        },
      });

      await this.obs.call('StartStream');
    } catch (err) {
      this.handleError(`startStream => ${key}`, err);
      throw new Error(`startStream`);
    }
  }

  public async stopStream(): Promise<void> {
    this.handleLog('stopStream', {});
    try {
      const { outputActive } = await this.obs.call('GetStreamStatus');
      if (outputActive) {
        await this.obs.call('StopStream');
      }
    } catch (err) {
      this.handleLog('stopStream', err);
      throw new Error(`stopStream`);
    }
  }

  public async showScene(sceneName: string): Promise<void> {
    this.handleLog('showScene', { sceneName });
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
    } catch (err) {
      this.handleError('showScene', err);
      throw new Error(`showScene`);
    }
  }

  public async changeVolumen(
    inputName: string,
    inputVolumeMul: number,
  ): Promise<void> {
    this.handleLog('changeVolumen', { inputName, inputVolumeMul });
    try {
      await this.obs.call('SetInputVolume', {
        inputName,
        inputVolumeMul,
      });
    } catch (err) {
      this.handleError('changeVolumen', err);
      throw new Error(`changeVolumen`);
    }
  }
  public async verify_obs(): Promise<ResponsePropio> {
    throw new Error('Method not implemented.');
  }
  public async execute_action(id_config_obs: number): Promise<ResponsePropio> {
    this.handleLog('execute_action', id_config_obs);
    const configObs = await this.findConfigObs(id_config_obs);
    if (!configObs.active) return { message: 'Inactive' };
    try {
      return await this.execMethod(configObs);
    } catch (e) {
      this.handleThrowError('execute_action', e);
    }
  }

  private async execMethod(
    configObs: ConfigObsInterface,
  ): Promise<ResponsePropio> {
    const { action, key_scene, key_stream, key_volumen, value_volumen } =
      configObs;

    if (key_scene) {
      await exectFunction(async () => {
        await this.showScene(key_scene);
      });
    }

    if (key_volumen && value_volumen) {
      const volume = Math.max(0, Math.min(value_volumen / 100, 1));
      await exectFunction(async () => {
        await this.changeVolumen(key_volumen, volume);
      });
    }

    if (key_stream) {
      await exectFunction(async () => {
        await this.startStream(key_stream);
      });
    }

    if (action === String(MethodValidObs.END_STREAM)) {
      await exectFunction(async () => {
        await this.stopStream();
      });
    }
    return { message: 'ok' };
  }

  private async findConfigObs(id: number): Promise<ConfigObsInterface> {
    return await this.send<ConfigObsInterface>(
      'findConfigObs',
      MethodValid.CONFIG_OBS_FIND_ONE,
      id,
    );
  }

  private async send<T>(
    method: string,
    pattern: any,
    data: any,
    timeoutMs = 30000,
  ): Promise<T> {
    this.handleLog(method, data);
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(timeout(timeoutMs)),
      );
    } catch (e) {
      this.handleThrowError(method, e);
    }
  }

  private handleError(method: string, e: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.error(`[${method}] Error => ${e?.message}`);
  }

  private handleLog(method: string, obj: any): void {
    const inline = JSON.stringify(obj).replace(/,/g, ', ').replace(/:/g, ': ');
    this.logger.debug(`[${method}] => ${inline}`);
  }

  private handleThrowError(method: string, e: any): never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.error(`[${method}] Error => ${e?.message}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw new RpcException(`OBS::${method} => ${e?.message}`);
  }
}
