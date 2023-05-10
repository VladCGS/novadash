import { Injectable } from '@nestjs/common';
import { BINANCE_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { getDataFromObject } from '@app/common/helpers';

@Injectable()
export class BinanceKeysExtractorService {
  extractKeysFromRequest(req: any): Record<BINANCE_HEADER_KEYS, string> {
    const keysSetup: Record<BINANCE_HEADER_KEYS, string> = {
      [BINANCE_HEADER_KEYS.KEY]: '',
      [BINANCE_HEADER_KEYS.SECRET]: '',
    };

    for (const key of Object.values(BINANCE_HEADER_KEYS)) {
      const foundValue = getDataFromObject(req.headers, [key]);
      if (foundValue) {
        keysSetup[key] = foundValue;
      }
    }

    return keysSetup;
  }
}
