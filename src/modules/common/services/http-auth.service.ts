import { IHttpConfig, IMap } from '../types/http-base.types';
import { HttpService } from './http.service';

export class EnhancedWithAuthHttpService {
  constructor(
    private httpService: HttpService,
    readonly httpConfig: IHttpConfig,
  ) {}

  public createQueryLink(base: string, parameters: IMap) {
    return this.httpService.createQueryLink(base, parameters);
  }

  private attachAuthHeader(config: IHttpConfig): IHttpConfig {
    return {
      ...this.httpConfig,
      ...config,
    };
  }

  public get<R>(url: string, config: IHttpConfig = {}): Promise<R> {
    return this.httpService.get<R>(url, this.attachAuthHeader(config));
  }

  public post<R, D>(
    url: string,
    data: D,
    config: IHttpConfig = {},
  ): Promise<R> {
    return this.httpService.post<R, D>(
      url,
      data,
      this.attachAuthHeader(config),
    );
  }

  public put<R, D>(url: string, data: D, config: IHttpConfig = {}): Promise<R> {
    return this.httpService.put<R, D>(url, data, this.attachAuthHeader(config));
  }

  public patch<R, D>(
    url: string,
    data: D,
    config: IHttpConfig = {},
  ): Promise<R> {
    return this.httpService.patch<R, D>(
      url,
      data,
      this.attachAuthHeader(config),
    );
  }

  public delete<R>(url: string, config: IHttpConfig = {}): Promise<R> {
    return this.httpService.delete<R>(url, this.attachAuthHeader(config));
  }
}
