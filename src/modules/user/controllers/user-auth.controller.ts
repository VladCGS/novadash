import { ApiOKResponse } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping/user.entity';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserLoginDTO, UserRegisterDTO } from '../dto/user-requests.dto';
import { AuthedUserDTO } from '../dto/user-response.dto';
import { UserAuthService } from '../services/user-auth.service';
import { UserService } from '../services/user.service';

@Controller('user')
@ApiTags('user (auth)')
export class UserAuthController {
  constructor(
    private userAuthService: UserAuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  @ApiOKResponse('Successfully logged in User', AuthedUserDTO)
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: User,
        sourceField: 'username',
        dataSource: 'body',
        entityField: 'username',
      },
    ]),
  )
  async login(@Body() body: UserLoginDTO): Promise<AuthedUserDTO> {
    const foundUser = await User.findOneBy({
      username: body.username,
    });

    if (!foundUser) {
      throw new HttpException(
        "Invalid password or user doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordValid = await this.userAuthService.validatePasswords({
      incomePassword: body.password,
      passDB: foundUser.hashedPassword,
    });

    if (!isPasswordValid) {
      throw new HttpException(
        "Invalid password or user doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const encryptedTokens = await this.userAuthService.signTokens({
      id: foundUser.id,
    });

    await this.userService.updateById(foundUser.id, {
      refreshToken: encryptedTokens.hashedRefreshToken,
      lastLogin: new Date(),
    });

    const userWithAllRelations = await this.userService.findOneWithAllRelations(
      { id: foundUser.id },
    );

    return {
      user: userWithAllRelations,
      refreshToken: encryptedTokens.refreshToken,
      accessToken: encryptedTokens.accessToken,
    };
  }

  @Post('register')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: User,
        sourceField: 'username',
        dataSource: 'body',
        entityField: 'username',
        errorIfExist: true,
      },
    ]),
  )
  async register(
    @Body() registerData: UserRegisterDTO,
  ): Promise<AuthedUserDTO> {
    const { password, username } = registerData;

    const createdUser = await this.userService.create({
      password,
      username,
    });

    return this.userAuthService.setupRefreshToken({ id: createdUser.id });
  }

  /* @Post('/recover-password')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: User,
        sourceField: 'email',
        dataSource: 'body',
        entityField: 'email',
      },
    ]),
  )
  @ApiOperation({
    summary: 'Send recover link to email',
  })
  @ApiOKResponse('Successfully sent email', '')
  async recoverPassword(@Body() data: EmailDTO) {
    await this.userAuthService.sendForgetPasswordMail(data.email);
  }

  @Post('/reset-password')
  @UseGuards(
    JWTAuthGuard,
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
    new CheckUserSubscription({
      dataSource: 'userData',
      keyName: 'id',
    }),
  )
  @ApiOperation({
    summary: 'Set new password',
  })
  @ApiOKResponse('Successfully reset password', '')
  async resetPassword(@Req() req, @Body() data: ResetPasswordDTO) {
    const { id } = req.userData;
    await this.userAuthService.setNewUserPassword({
      newPassword: data.password,
      userId: id,
    });
  }*/
}
