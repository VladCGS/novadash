import { WSCheckIsNotIncreaseLiquidityGuard } from '@app/common/guards/ws-check-is-not-increase-liquidity.guard';
import { WSCheckRedisKeyExistsGuard } from '@app/common/guards/ws-check-redis-key-exists.guard';
import { WSFormRedisKeyGuard } from '@app/common/guards/ws-form-redis-key.guard';
import { SocketUserBaseGateway } from '@app/common/modules/websocket/gateway/socket-user-base.gateway';
import { WSValidationPipe } from '@app/common/pipes/ws-validation.pipe';
import {
  SOCKET_ACTIONS,
  SOCKET_CHANNELS,
  SOCKET_USER_NAMESPACES,
} from '@app/common/utils/socket-user-status-base.util';

import { Logger, UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  CalculateUniswapV3DepositDTO,
  CalculateUniswapV3PoolAprDTO,
  CalculateUniswapV3TicksDTO,
} from '../dtos/socket-pools-dynamic-calculation-request.dto';
import {
  NewUniswapV3PoolAprDTO,
  NewUniswapV3PoolDepositAmountDTO,
  UniswapV3PoolCorrectRangesDTO,
} from '../dtos/socket-pools-dynamic-calculation-response.dto';
import { UniswapV3DynamicCalculateService } from '../services/uniswap-v3-dynamic-calculate.service';

@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  path: '/api/ws',
  namespace: SOCKET_USER_NAMESPACES.UNISWAP_V3,
})
export class SocketPoolsDynamicCalculation extends SocketUserBaseGateway {
  constructor(
    private uniswapV3CalculateService: UniswapV3DynamicCalculateService,
  ) {
    super('');
    this.logger = new Logger(SocketPoolsDynamicCalculation.name);
  }

  @UseGuards(
    new WSFormRedisKeyGuard(['userId', 'address', 'chainIdDB']),
    WSCheckRedisKeyExistsGuard,
  )
  @SubscribeMessage(SOCKET_ACTIONS.CALCULATE_APR)
  async calculateApr(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CalculateUniswapV3PoolAprDTO,
  ): Promise<WsResponse<NewUniswapV3PoolAprDTO>> {
    const data = await this.uniswapV3CalculateService.calculateApr(body);

    return { event: SOCKET_CHANNELS.LOG_NEW_APR, data };
  }

  @UseGuards(
    new WSFormRedisKeyGuard(['userId', 'address', 'chainIdDB']),
    WSCheckRedisKeyExistsGuard,
    WSCheckIsNotIncreaseLiquidityGuard,
  )
  @SubscribeMessage(SOCKET_ACTIONS.CALCULATE_TICKS)
  async calculateTicks(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CalculateUniswapV3TicksDTO,
  ): Promise<WsResponse<UniswapV3PoolCorrectRangesDTO>> {
    const data = await this.uniswapV3CalculateService.calculateTicks(body);

    return { event: SOCKET_CHANNELS.LOG_CORRECT_RANGES, data };
  }

  @UseGuards(
    new WSFormRedisKeyGuard(['userId', 'address', 'chainIdDB']),
    WSCheckRedisKeyExistsGuard,
  )
  @SubscribeMessage(SOCKET_ACTIONS.CALCULATE_AMOUNTS)
  async calculateDepositAmount(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CalculateUniswapV3DepositDTO,
  ): Promise<WsResponse<NewUniswapV3PoolDepositAmountDTO>> {
    // if quoteAmount changes - baseAmount=undefined
    // if baseAmount changes - quoteAmount=undefined
    // if ticks changes - baseAmount=undefined
    const data = await this.uniswapV3CalculateService.calculateDepositAmount(
      body,
    );

    return { event: SOCKET_CHANNELS.LOG_NEW_AMOUNTS, data };
  }
}
