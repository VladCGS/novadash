import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UniswapV3IncreaseLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-increasing-response.dto';
import { FormUniswapV3IncreasingModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-increasing-request.dto';
import { UniswapV3LiquidityIncreasingService } from '../services/uniswap-v3-liquidity-increasing.service';

@Controller('pools/uniswap-v3/liquidity-increasing')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['chainIdDB'],
    findIn: 'body',
  }),
  new CheckRecordFieldExistGuard([
    {
      Entity: Chain,
      dataSource: 'body',
      entityField: 'id',
      sourceField: 'chainIdDB',
    },
  ]),
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: User,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@ApiTags('uniswap-v3-pools ( Increase )')
@Roles(AppRoles.USER)
export class UniswapV3PoolsLiquidityIncreasingController {
  constructor(
    private uniswapV3LiquidityIncreasingService: UniswapV3LiquidityIncreasingService,
  ) {}

  @Post('modal-initialization-data')
  @ApiOKResponse(
    'Successfully fetched pool initialization data',
    UniswapV3IncreaseLiquidityModalInitializationDataDTO,
  )
  async getModalInitializationData(
    @Body() body: FormUniswapV3IncreasingModalInitializationDataDTO,
    @Req() req,
  ): Promise<UniswapV3IncreaseLiquidityModalInitializationDataDTO> {
    const { id: userId } = req.userData;

    return this.uniswapV3LiquidityIncreasingService.getIncreaseLiquidityModalInitializationData(
      body,
      userId,
    );
  }
}
