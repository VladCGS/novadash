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
export class CheckIfEnoughNativeBalanceForFeeGuard implements CanActivate {
  constructor(
    private readonly exchDebridgeFeeCheckService: DebridgeFeeCheckService,
    private readonly dataChainService: DataChainService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const body: DEXSwapSellGetQuoteDTO = request.body;

    const chainDBId = body.sell.chainId;

    const foundChain = await this.dataChainService.findOneByIdOrFail(chainDBId);

    const chainSlug = foundChain.slug;
    const walletAddress = body.sell.walletAddress;
    const isEnoughNativeBalanceFoFee =
      await this.exchDebridgeFeeCheckService.checkIfEnoughNativeBalanceForFee(
        chainSlug,
        walletAddress,
      );

    if (!isEnoughNativeBalanceFoFee.enough) {
      const phrase = formAlphapingExceptionBody(
        ALPHAPING_CODES.notEnoughNativeBalanceForFee,
      );
      phrase.message += `. Required > ${isEnoughNativeBalanceFoFee.required}`;
      throw new HttpException(phrase, HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
