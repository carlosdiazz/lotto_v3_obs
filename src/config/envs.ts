import { timeZoneValidator } from '@carlosdiazz/lottodiz-shared';
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STATE: string;

  NATS_SERVERS: string[];
  NATS_USER: string;
  NATS_PASSWORD: string;
  NATS_CA_PATH: string;
  NATS_CLIENT_CERT_PATH: string;
  NATS_CLIENT_KEY_PATH: string;

  OBS_IP: string;
  OBS_PORT: number;
  OBS_PASSWORD: string;

  CHANNEL_ID: number;

  TZ: string;
}
//TEST
const envsSchema = joi
  .object({
    PORT: joi.number().default(4000),
    STATE: joi.string().default('DEV'),

    NATS_SERVERS: joi.array().items(joi.string()).required(),
    NATS_USER: joi.string().default(''),
    NATS_PASSWORD: joi.string().default(''),
    NATS_CA_PATH: joi.string().default(''),
    NATS_CLIENT_CERT_PATH: joi.string().default(''),
    NATS_CLIENT_KEY_PATH: joi.string().default(''),

    OBS_IP: joi.string().required(),
    OBS_PORT: joi.number().required(),
    OBS_PASSWORD: joi.string().required(),

    CHANNEL_ID: joi.number().required(),

    TZ: joi.string().required().custom(timeZoneValidator),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config Validation Error ENV ${error.message}`);
}

const enVars: EnvVars = value;

export const envs: EnvVars = {
  PORT: enVars.PORT,
  STATE: enVars.STATE,

  NATS_SERVERS: enVars.NATS_SERVERS,
  NATS_PASSWORD: enVars.NATS_PASSWORD,
  NATS_USER: enVars.NATS_USER,
  NATS_CA_PATH: enVars.NATS_CA_PATH,
  NATS_CLIENT_CERT_PATH: enVars.NATS_CLIENT_CERT_PATH,
  NATS_CLIENT_KEY_PATH: enVars.NATS_CLIENT_KEY_PATH,

  OBS_IP: enVars.OBS_IP,
  OBS_PASSWORD: enVars.OBS_PASSWORD,
  OBS_PORT: enVars.OBS_PORT,

  CHANNEL_ID: enVars.CHANNEL_ID,

  TZ: enVars.TZ,
};
