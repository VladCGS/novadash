import { Injectable } from '@nestjs/common';
import { KUCOIN_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { getDataFromObject } from '@app/common/helpers';

@Injectable()
export class KucoinKeysExtractorService {
  extractKeysFromRequest(req: any): Record<KUCOIN_HEADER_KEYS, string> {
    const keysSetup: Record<KUCOIN_HEADER_KEYS, string> = {
      [KUCOIN_HEADER_KEYS.KEY]: '',
      [KUCOIN_HEADER_KEYS.PASSPHRASE]: '',
      [KUCOIN_HEADER_KEYS.SECRET]: '',
    };

    for (const key of Object.values(KUCOIN_HEADER_KEYS)) {
      const foundValue = getDataFromObject(req.headers, [key]);
      if (foundValue) {
        keysSetup[key] = foundValue;
      }
    }

    return keysSetup;
  }
}
