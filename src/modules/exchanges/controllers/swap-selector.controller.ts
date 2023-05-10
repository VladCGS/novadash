import { ApiGetResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { DataExchangeSwapSelectorService } from '@app/common/modules/data-exchange-swap/services/data.exchange-swap-selector.service';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StableCoinsPairsDTO } from '../dto/stablecoins-response.dto';
import {
  GetExchangesByTokensDTO,
  GetPagePairsForCexTokenQueryDTO,
  GetPagePairsForTokenQueryDTO,
  GetPairsForTokenQueryDTO,
} from '../dto/swap-selector-requests.dto';
import {
  ExchangeMetaDTO,
  FoundExchangesByTokenPairsDTO,
  PairsForCexTokenPageDTO,
  PairsForSellTokenPageDTO,
} from '../dto/swap-selector-response.dto';
import { ExchangeSwapService } from '../services/exchange-swap.service';
import { SwapPairsForCexTokenService } from '../services/swap-pairs-for-cex-token.service';
import { Stablecoin0xSwapService } from '../services/stablecoin-0x-swap.service';

@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['id'],
    findIn: 'userData',
  }),
  new CheckRecordFieldExistGuard([
    {
      isFieldOptional: true,
      sourceField: 'id',
      Entity: User,
      entityField: 'id',
      dataSource: 'userData',
    },
  ]),
)
@Roles(AppRoles.USER)
@Controller('exchanges/swap/selectors')
@ApiTags('EXCHANGE swap selectors')
export class SwapSelectorController {
  constructor(
    private exchangeSwapService: ExchangeSwapService,
    private dataExchangeSwapSelectorService: DataExchangeSwapSelectorService,
    private stablecoin0xSwapService: Stablecoin0xSwapService,
    private swapPairsForCexTokenService: SwapPairsForCexTokenService,
  ) {}

  @Post('/pairs-for-token')
  @ApiOperation({ summary: 'Get tokens available to be pair' })
  @ApiGetResponse('Successfully got token ids', PairsForSellTokenPageDTO)
  async getPagePairsForToken(
    @Req() req,
    @Body() body: GetPagePairsForTokenQueryDTO,
  ): Promise<PairsForSellTokenPageDTO> {
    const { id } = req.userData;
    return this.exchangeSwapService.getPairsForToken(id, body);
  }

  @Post('/stablecoins-for-token')
  @ApiOperation({
    summary: 'Get st' + 'ablecoins available to be pair on single chain',
  })
  @ApiGetResponse('Successfully got tokens', PairsForSellTokenPageDTO)
  async getStablecoinsPairsForToken(
    @Req() req,
    @Body() body: GetPairsForTokenQueryDTO,
  ): Promise<StableCoinsPairsDTO> {
    return this.stablecoin0xSwapService.getStableCoinsPairsForToken(body);
  }

  @Post('/exchanges-by-pair')
  @ApiOperation({ summary: 'Get services available for current tokens pair' })
  async getServiceByTokenPair(
    @Req() req,
    @Body() body: GetExchangesByTokensDTO,
  ): Promise<FoundExchangesByTokenPairsDTO> {
    const foundTokenIds =
      await this.exchangeSwapService.getTokenIdsByTokensData(body.tokens);

    if (!foundTokenIds) {
      throw new HttpException(
        'Tokens with this meta don`t exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const areTokensSingleChain =
      this.exchangeSwapService.checkAreTokensSingleChain(body.tokens);

    const foundExchanges =
      await this.dataExchangeSwapSelectorService.getServicesIdsByTokenIds(
        foundTokenIds,
      );

    const filteredExchanges = foundExchanges.filter((exch: ExchangeMetaDTO) => {
      return areTokensSingleChain ? exch.canSingleChain : exch.canMultiChain;
    });

    return {
      services: filteredExchanges,
    };
  }

  @Post('/pairs-for-cex-token')
  @ApiOperation({ summary: 'Get tokens available to be pair' })
  @ApiGetResponse('Successfully got token ids', PairsForSellTokenPageDTO)
  async getPagePairsForCexToken(
    @Req() req,
    @Body() body: GetPagePairsForCexTokenQueryDTO,
  ): Promise<PairsForCexTokenPageDTO> {
    return this.swapPairsForCexTokenService.getPagePairsForCexToken(body);
  }
}
