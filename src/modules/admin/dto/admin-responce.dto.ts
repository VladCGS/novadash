import { ApiProperty } from '@nestjs/swagger';

export class AdminAccessDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  hashedRefreshToken: string;
}
