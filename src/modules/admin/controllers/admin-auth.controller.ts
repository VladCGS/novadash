import { Admin } from '@app/common/entities/alphaping';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { scryptCompare, scryptHash } from '@app/common/helpers/crypto.helper';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { AdminAuthDTO, AdminRegisterDTO } from '../dto/admin-request.dto';
import { AdminAccessDTO } from '../dto/admin-responce.dto';
import { AdminAuthService } from '../services/admin-auth.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private adminAuthService: AdminAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/login')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: Admin,
        sourceField: 'login',
        dataSource: 'body',
        entityField: 'login',
      },
    ]),
  )
  async login(@Req() req, @Body() body: AdminAuthDTO): Promise<AdminAccessDTO> {
    const { login, password } = body;

    const foundAdmin = await Admin.findOneBy({
      login,
    });

    if (!foundAdmin) {
      throw new HttpException(
        "Invalid password or admin doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await scryptCompare({
      hashed: foundAdmin.hashedPassword,
      raw: password,
    });

    if (!isPasswordValid) {
      throw new HttpException(
        "Invalid password or admin doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const signed = await this.adminAuthService.signTokens({
      id: foundAdmin.id,
    });

    return {
      id: foundAdmin.id,
      accessToken: signed.accessToken,
      refreshToken: signed.refreshToken,
      hashedRefreshToken: signed.hashedRefreshToken,
    };
  }

  @Post('/register')
  async register(
    @Req() req,
    @Body() body: AdminRegisterDTO,
  ): Promise<AdminAccessDTO> {
    const { login, password, secret } = body;

    if (secret !== this.configService.get('ADMIN_SECRET')) {
      throw new HttpException(
        "Invalid password or admin doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundAdmin = await Admin.findOneBy({
      login,
    });

    if (foundAdmin) {
      throw new HttpException('Admin already exist!', HttpStatus.CONFLICT);
    }

    const createdAdmin = await Admin.create({
      login,
      hashedPassword: await scryptHash({ toHash: password }),
    }).save();

    const signed = await this.adminAuthService.signTokens({
      id: createdAdmin.id,
    });

    return {
      id: createdAdmin.id,
      accessToken: signed.accessToken,
      refreshToken: signed.refreshToken,
      hashedRefreshToken: signed.hashedRefreshToken,
    };
  }
}
