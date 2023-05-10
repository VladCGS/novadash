import { HttpService } from '@app/common/modules/common/services/http.service';
import { ChainSlugs } from '@app/common/types/chain.types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { api0xSupportedLinks } from '../constants/api-0x-links.consr';
import {
  I0xPrice,
  I0xQuote,
  IGet0xPrice,
  IGet0xQuote,
} from '../types/pure-0x.types';

@Injectable()
export class Pure0xService {
  private fetchingService = new HttpService(axios, process.env.EXCH_0X_API_URL);

  setupApiLinkByChain(chain: ChainSlugs): void {
    this.fetchingService = new HttpService(axios, api0xSupportedLinks[chain]);
  }

  async getPrice(
    chainSlug: ChainSlugs,
    options: IGet0xPrice,
  ): Promise<I0xPrice> {
    this.setupApiLinkByChain(chainSlug);

    try {
      const { data } = await this.fetchingService.get<I0xPrice>(
        'swap/v1/price',
        {
          params: options,
        },
      );

      return data;
    } catch (e) {
      console.log(e);
      throw new HttpException('Could`t fetch quote', HttpStatus.BAD_GATEWAY);
    }
  }

  async getQuote(
    chainSlug: ChainSlugs,
    options: IGet0xQuote,
  ): Promise<I0xQuote> {
    this.setupApiLinkByChain(chainSlug);

    try {
      const { data } = await this.fetchingService.get<I0xQuote>(
        'swap/v1/quote',
        {
          params: options,
        },
      );
      return data;
    } catch (e) {
      console.log(e);
    }
  }
}
