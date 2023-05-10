import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { APP_STATES_NAMES } from '../types/app-states-names.const';
import { ChainsStatesEnum } from '../types/state-chains.types';
import { ExchangesSwapStatesEnum } from '../types/state-exchanges-swap.types';
import { ExchangesOnOffRampStatesEnum } from '../types/state-on-off-ramp.types';
import { PlatformCoinsStatesEnum } from '../types/state-platform-coins.types';

export class FeaturesStatesDTO {
  @ApiProperty({
    example: {
      status: 1,
    },
    description: 'Status of chains init',
  })
  @IsNumber()
  [APP_STATES_NAMES.CHAINS]: ChainsStatesEnum;

  @ApiProperty({
    example: {
      status: 1,
    },
    description: 'Status of coins init',
  })
  @IsNumber()
  [APP_STATES_NAMES.PLATFORM_COINS]: PlatformCoinsStatesEnum;

  @ApiProperty({
    example: {
      status: 1,
    },
    description: 'Status of services init',
  })
  @IsNumber()
  [APP_STATES_NAMES.EXCHANGES_SWAP]: ExchangesSwapStatesEnum;

  @ApiProperty({
    example: {
      status: 1,
    },
    description: 'Status of on off ramp init',
  })
  @IsNumber()
  [APP_STATES_NAMES.EXCHANGES_ON_OFF_RAMP]: ExchangesOnOffRampStatesEnum;
}

export class MicroservicesStatesDTO {
  @ApiProperty()
  [RMQ_SERVICES_NAMES.MS_PAIRS]: string;

  @ApiProperty()
  [RMQ_SERVICES_NAMES.MS_TRANSACTION]: string;

  @ApiProperty()
  [RMQ_SERVICES_NAMES.MS_BALANCES]: string;
}

export class AlphapingStatesDTO {
  @ApiProperty()
  microservices: MicroservicesStatesDTO;

  @ApiProperty()
  features: FeaturesStatesDTO;
}
