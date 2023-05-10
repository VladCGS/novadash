import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import { DebridgeFeeCheckService } from '../services/debridge-fee-check.service';

@Injectable()
export class CheckIfEnoughSellNativeValueForDebridgeFeeGuard
  implements CanActivate
{
  constructor(
    private readonly exchDebridgeFeeCheckService: DebridgeFeeCheckService,
    private readonly dataChainService: DataChainService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const body: DEXSwapSellGetQuoteDTO = request.body;

    if (body.sell.tokenAddress != NATIVE_UNI_ADDRESS) {
      return true;
    }

    const chainDBId = body.sell.chainId;

    const foundChain = await this.dataChainService.findOneByIdOrFail(chainDBId);

    const chainSlug = foundChain.slug;
    const nativeNormalAmount = body.sell.amount;
    const isEnoughSellNativeAmount =
      await this.exchDebridgeFeeCheckService.checkEnoughNativeValueByDebridgeFee(
        nativeNormalAmount,
        chainSlug,
      );

    if (!isEnoughSellNativeAmount.enough) {
      const phrase = formAlphapingExceptionBody(
        ALPHAPING_CODES.tooSmallTokenValue,
      );
      phrase.message += `. Required > ${isEnoughSellNativeAmount.required}`;
      throw new HttpException(phrase, HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
