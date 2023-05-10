import { PlatformCoin } from '@app/common/entities/alphaping';
import { ExchangeSupportedCoin } from '@app/common/entities/pairs';
import { DataStablecoinService } from '@app/common/modules/data-stablecoin/services/data.stablecoin.service';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { StableCoinsPairsDTO } from '../dto/stablecoins-response.dto';
import { GetPairsForTokenQueryDTO } from '../dto/swap-selector-requests.dto';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { PayableDEXHttpSlugs } from '@app/common/constants';

@Injectable()
export class Stablecoin0xSwapService {
  constructor(private dataStablecoinService: DataStablecoinService) {}

  async getStableCoinsPairsForToken({
    tokenAddress,
    chainId,
  }: GetPairsForTokenQueryDTO): Promise<StableCoinsPairsDTO> {
    if (tokenAddress !== NATIVE_UNI_ADDRESS) {
      tokenAddress = tokenAddress.toLocaleLowerCase();
    }

    const supportedCoinExist = await this.checkIs0xSupportedCoinExists(
      tokenAddress,
      chainId,
    );

    if (!supportedCoinExist) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.zeroExCoinNosSupported),
        HttpStatus.NOT_FOUND,
      );
    }

    const foundSupportedStablesBy0x =
      await this.find0xSupportedStableCoinsByChain(chainId);

    if (!foundSupportedStablesBy0x.length) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.pairsNotFoind),
        HttpStatus.NOT_FOUND,
      );
    }

    return this.formStableCoinsPairResponse(
      foundSupportedStablesBy0x
        .map((e: ExchangeSupportedCoin) => e.platformCoin)
        .filter((p: PlatformCoin) => p.tokenAddress !== tokenAddress),
    );
  }

  private async find0xSupportedStableCoinsByChain(
    chainId: string,
  ): Promise<ExchangeSupportedCoin[]> {
    const foundStableCoins =
      await this.dataStablecoinService.getStablecoinsByChainIdOrFail(chainId);

    const stableCoinsIds: string[] = foundStableCoins.map(
      (p: PlatformCoin) => p.id,
    );

    return ExchangeSupportedCoin.find({
      where: {
        platformCoin: {
          id: In(stableCoinsIds),
          chain: { id: chainId },
        },
        exchangeSwap: {
          urlSlug: PayableDEXHttpSlugs.ZEROEX,
        },
      },
      relations: {
        platformCoin: {
          chain: true,
          coinMetadata: true,
        },
      },
    });
  }

  private async checkIs0xSupportedCoinExists(
    tokenAddress: string,
    chainId: string,
  ): Promise<boolean> {
    const found0xCoin = await ExchangeSupportedCoin.findOne({
      where: {
        platformCoin: {
          tokenAddress,
          chain: { id: chainId },
        },
        exchangeSwap: {
          urlSlug: PayableDEXHttpSlugs.ZEROEX,
        },
      },
    });

    return !!found0xCoin;
  }

  private formStableCoinsPairResponse(
    stableCoins: PlatformCoin[],
  ): StableCoinsPairsDTO {
    return {
      result: stableCoins.map((stablecoin: PlatformCoin) => ({
        id: stablecoin.id,
        tokenAddress: stablecoin.tokenAddress,
        name: stablecoin.coinMetadata.name,
        image: stablecoin.coinMetadata.image,
        symbol: stablecoin.coinMetadata.symbol,
        chain: {
          image: stablecoin.chain.image,
          name: stablecoin.chain.name,
          slug: stablecoin.chain.slug,
        },
      })),
    };
  }
}
