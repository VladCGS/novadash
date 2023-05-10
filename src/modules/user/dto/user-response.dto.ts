import { User } from '@app/common/entities/alphaping/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';

export class AuthedUserDTO {
  @IsObject()
  @Type(() => User)
  user: User;

  @IsString()
  refreshToken: string;

  @IsString()
  accessToken: string;
}