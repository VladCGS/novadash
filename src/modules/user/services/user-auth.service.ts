import { IdDTO } from '@app/common/dtos';
import { scryptCompare, scryptHash } from '@app/common/helpers/crypto.helper';
import { AppRoles } from '@app/common/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenRefreshDTO } from '../dto/user-requests.dto';
import { AuthedUserDTO } from '../dto/user-response.dto';
import { IValidatePassword } from '../types/user-auth.types';
import { UserService } from './user.service';

@Injectable()
export class UserAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validatePasswords({
    incomePassword,
    passDB,
  }: IValidatePassword): Promise<boolean> {
    return scryptCompare({ hashed: passDB, raw: incomePassword });
  }

  async setupRefreshToken({ id }: IdDTO): Promise<AuthedUserDTO> {
    const { hashedRefreshToken, accessToken, refreshToken } =
      await this.signTokens({ id });

    const updatedUser = await this.userService.updateById(id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      user: updatedUser,
      accessToken,
      refreshToken,
    };
  }

  async signTokens(payload: IdDTO) {
    const payloadWithRole = {
      ...payload,
      roles: [AppRoles.USER],
    };
    const accessToken = this.jwtService.sign(payloadWithRole);
    const refreshToken = this.jwtService.sign(payloadWithRole, {
      expiresIn: '7d',
    });
    const hashedRefreshToken = await scryptHash({
      toHash: refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      hashedRefreshToken,
    };
  }

  async updateAccessToken(userId: string, incomeData: AuthTokenRefreshDTO) {
    const user = await this.userService.findOneWithAllRelations({
      id: userId,
    });

    const comparedTokens = await scryptCompare({
      raw: incomeData.refreshToken,
      hashed: user.refreshToken,
    });

    if (!comparedTokens) {
      throw new HttpException(
        "Refresh token doesn't match token stored in db",
        HttpStatus.BAD_REQUEST,
      );
    }

    const { refreshToken, accessToken, hashedRefreshToken } =
      await this.signTokens({ id: user.id });

    await this.userService.updateById(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      refreshToken,
      accessToken,
    };
  }

  /*async sendForgetPasswordMail(email: string): Promise<void> {
    const user = await User.findOneBy({
      email,
    });

    const subscriptions = await this.recurlyService.getAccountSubscriptions(
      user.recurlyAccountCode,
    );

    if (!subscriptions.length)
      throw new HttpException(
        'You are not subscribed to get recovery link',
        HttpStatus.FORBIDDEN,
      );

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '10m' });

    const url = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    const options: Nodemailer.SendMailOptions = {
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Password Reset',
      html: `
      <h1> To reset your password click link below ⤵️</h1><br>
      <a href=${url}>RESET PASSWORD</a><br>
      <h1>Link is valid only 10 minutes after getting this mail!</h1>`,
    };

    await this.mailService.sendMail(options);
  }

  async setNewUserPassword({ newPassword, userId }: ISetNewUserPassword) {
    const user = await User.findOneBy({
      id: userId,
    });

    const comparePasswords = await scryptCompare({
      raw: newPassword,
      hashed: user.hashedPassword,
    });

    if (comparePasswords)
      throw new HttpException(
        "Password's can't be the same",
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await scryptHash({
      toHash: newPassword,
      rounds: 10,
    });

    return this.userService.updateById(user.id, {
      hashedPassword,
    });
  }*/
}
