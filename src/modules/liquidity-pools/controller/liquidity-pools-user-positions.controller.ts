import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageQueryDTO } from '../../transaction/dto/transaction-requests.dto';
import {
  PoolsActivePositionsPageDTO,
  PoolsInactivePositionsPageDTO,
} from '../dto/liquidity-pools-user-positions-response.dto';
import { UserPoolsPositionsService } from '../service/user-pools-positions.service';

@Controller('liquidity-pools/user-positions')
@ApiTags('liquidity-pools (User positions)')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
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
@Roles(AppRoles.USER)
export class LiquidityPoolsUserPositionsController {
  constructor(private userPoolsPositionsService: UserPoolsPositionsService) {}

  @Post('active')
  @ApiOKResponse(
    'Successfully fetched pools active positions',
    PoolsActivePositionsPageDTO,
  )
  async getActivePositions(@Req() req, @Body() body: PageQueryDTO) {
    const userId = req.userData.id;

    return this.userPoolsPositionsService.getActivePositions(body, userId);
  }

  @Post('inactive')
  @ApiOKResponse(
    'Successfully fetched pools inactive positions',
    PoolsInactivePositionsPageDTO,
  )
  async getInactivePositions(@Req() req, @Body() body: PageQueryDTO) {
    const userId = req.userData.id;

    return this.userPoolsPositionsService.getInactivePositions(body, userId);
  }
}
