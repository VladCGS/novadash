import { ApiOKResponse, Roles } from '@app/common/decorators';
import { IdDTO } from '@app/common/dtos';
import { User } from '@app/common/entities/alphaping/user.entity';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthTokenRefreshDTO,
  RefreshTokensDTO,
} from '../dto/user-requests.dto';
import { UserAuthService } from '../services/user-auth.service';
import { UserService } from '../services/user.service';

@Controller('user')
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
@ApiTags('user')
@ApiBearerAuth('JWT')
export class UserController {
  constructor(
    private userService: UserService,
    private userAuthService: UserAuthService,
  ) {}

  @Get('/me')
  @ApiOKResponse('User successfully found', User)
  async getOne(@Req() req): Promise<User> {
    const { id } = req.userData;

    return this.userService.findOneWithAllRelations({
      id,
    });
  }

  @Post('/refresh-token')
  @UseGuards(
    new CheckIdValidGuard({
      findIn: 'userData',
    }),
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'userData',
        sourceField: 'id',
        Entity: User,
        entityField: 'id',
      },
    ]),
  )
  async refreshToken(
    @Req() req,
    @Body() data: AuthTokenRefreshDTO,
  ): Promise<RefreshTokensDTO> {
    const { id } = req.userData;

    return this.userAuthService.updateAccessToken(id, data);
  }

  @Put('/currency')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'userData',
        sourceField: 'id',
        Entity: User,
        entityField: 'id',
      },
    ]),
  )
  async setCurrency(@Req() req, @Body() body: IdDTO): Promise<User> {
    const { id } = req.userData;

    return this.userService.setCurrency({
      userId: id,
      fiatId: body.id,
    });
  }
}
