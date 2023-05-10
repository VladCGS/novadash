import { SingleWeb3NativeOrERC20TransactionDataDTO } from '@app/common/dtos/web3.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString } from 'class-validator';
import { ChainSlugs } from '@app/common/types/chain.types';
import {
  SwapAssetWithAmountDTO,
  SwapCurrencyWithAmountAndWeiDTO,
  SwapCurrencyWithAmountDTO,
} from './payable-common.requests.dto';

export class CEXSwapQuoteFeesBaseDTO {
  @ApiProperty({ isArray: true, type: () => SwapAssetWithAmountDTO })
  @IsArray()
  @Type(() => SwapAssetWithAmountDTO)
  feesIncluded: SwapAssetWithAmountDTO[];

  @ApiProperty({ isArray: true, type: () => SwapAssetWithAmountDTO })
  @IsArray()
  @Type(() => SwapAssetWithAmountDTO)
  feesToPay: SwapAssetWithAmountDTO[];
}

export class CEXSwapQuoteDTO extends CEXSwapQuoteFeesBaseDTO {
  @ApiProperty()
  @IsObject()
  @Type(() => SwapCurrencyWithAmountDTO)
  sell: SwapCurrencyWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => SwapCurrencyWithAmountDTO)
  buy: SwapCurrencyWithAmountDTO;
}

export class CEXSwapQuoteWithWeiDTO extends CEXSwapQuoteFeesBaseDTO {
  @ApiProperty()
  @IsObject()
  @Type(() => SwapCurrencyWithAmountDTO)
  sell: SwapCurrencyWithAmountAndWeiDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => SwapCurrencyWithAmountDTO)
  buy: SwapCurrencyWithAmountAndWeiDTO;
}

export class CEXSwapTrackerSetupRangoDTO {
  @ApiProperty()
  @IsString()
  requestId: string;
}

export class CEXSwapTrackerSetupDeBridgeDTO {
  @ApiProperty()
  @IsString()
  senderChainSlug: ChainSlugs;

  @ApiProperty()
  @IsString()
  receiverChainSlug: ChainSlugs;
}

export class SwapPaymentDataDTO<
  T = undefined,
> extends SingleWeb3NativeOrERC20TransactionDataDTO {
  @ApiProperty()
  transactionCheckerSetup?: T;
}
