import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AdminAuthDTO {
  @ApiProperty({
    description: 'Admin login',
  })
  @IsString()
  login: string;

  @ApiProperty({
    description: 'Admin password',
  })
  @IsString()
  password: string;
}

export class AdminRegisterDTO extends AdminAuthDTO {
  @ApiProperty({
    description: 'Secret',
  })
  secret: string;
}
