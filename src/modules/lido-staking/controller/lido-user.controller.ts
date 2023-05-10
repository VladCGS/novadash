import { Roles } from "@app/common/decorators";
import { User } from "@app/common/entities/alphaping";
import { CheckIdValidGuard, JWTAuthGuard, RolesGuard } from "@app/common/guards";
import { CheckRecordFieldExistGuard } from "@app/common/guards/check-record-field-exist.guard";
import { AppRoles } from "@app/common/types";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LidoUserService } from "../service/lido-user.service";
import { LidoBalancesRequestDTO } from "../dto/lido-user-request.dto";

@Controller('staking/lido')
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
@ApiTags('lido-staking ( Balance )')
@Roles(AppRoles.USER)
export class LidoUserController {
  constructor(private lidoUserService: LidoUserService) {}

  @Post('/get-all')
  async getAllStakedAssets(@Req() req, @Body() body: LidoBalancesRequestDTO) {
    const { id: userId } = req.userData;

    return this.lidoUserService.getAllStakedBalances(userId, body);
  }
}