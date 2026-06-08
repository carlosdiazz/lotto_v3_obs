import { ResponseInterface } from '@carlosdiazz/lottodiz-shared';

export class ResponsePropio implements ResponseInterface {
  public message?: string;

  public error?: boolean;

  public statusCode?: number;
}
