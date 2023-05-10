import { IdDTO } from '@app/common/dtos';
import { scryptHash } from '@app/common/helpers/crypto.helper';
import { AppRoles } from '@app/common/types';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(private jwtService: JwtService) {}

  async signTokens(payload: IdDTO) {
    const payloadWithRole = {
      ...payload,
      roles: [AppRoles.ADMIN],
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
}
