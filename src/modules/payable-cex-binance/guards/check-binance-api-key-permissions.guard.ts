import { BINANCE_REQUIRED_PERMISSIONS } from '@app/common/constants/permissions-binance.const';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';
import { BinanceKeysExtractorService } from '../services/binance-keys-extractor.service';

@Injectable()
export class CheckBinanceAPIKeyPermissionsGuard implements CanActivate {
  constructor(
    private readonly pureBinanceService: PureBinanceService,
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const requiredPermissions = BINANCE_REQUIRED_PERMISSIONS;

    const apiKey = request.headers.binancekey;
    const apiSecret = request.headers.binancesecret;

    if (!apiKey || !apiSecret) return true;

    try {
      const permissions = await this.pureBinanceService.getApiPermissions(
        this.binanceKeysExtractorService.extractKeysFromRequest(request),
      );
      for (const permissionName of requiredPermissions) {
        if (!permissions[permissionName]) {
          throw new HttpException(
            formAlphapingExceptionBody(
              ALPHAPING_CODES.binanceApiPermissionsWrong,
            ),
            HttpStatus.FORBIDDEN,
          );
        }
      }
      return true;
    } catch (err) {
      if (err.code && err.message) {
        throw new HttpException(
          {
            message: err.message,
            code: err.code,
          },
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
  }
}
