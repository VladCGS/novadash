import {
  digitsRegex,
  lowercaseRegex,
  noTrailingSpacesRegex,
  specialCharacterRegex,
  uppercaseRegex,
} from '@app/common/schemas/regex';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RefreshTokensDTO {
  @IsString()
  refreshToken: string;

  @IsString()
  accessToken: string;
}

export class AuthTokenRefreshDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/*export class EmailDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}*/

export class UserRegisterDTO {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Too long' })
  @Matches(noTrailingSpacesRegex, { message: 'Please remove spaces' })
  username: string;

  @ApiProperty({ example: 'qwerty1234', minLength: 8 })
  @IsNotEmpty()
  @MinLength(15, { message: 'At least 15 characters' })
  @MaxLength(255, { message: 'Too long' })
  @IsString()
  @Matches(uppercaseRegex, {
    message: 'Please add at least 2 uppercase characters',
  })
  @Matches(lowercaseRegex, {
    message: 'Please add at least 2 lowercase characters',
  })
  @Matches(digitsRegex, { message: 'Please add at least one digit' })
  @Matches(specialCharacterRegex, {
    message: 'Please add at least one special character',
  })
  @Matches(noTrailingSpacesRegex, { message: 'Please remove spaces' })
  password: string;
}

export class UserLoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Too long' })
  @Matches(noTrailingSpacesRegex, { message: 'Please remove spaces' })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(15, { message: 'At least 15 characters' })
  @MaxLength(255, { message: 'Too long' })
  @Matches(noTrailingSpacesRegex, { message: 'Please remove spaces' })
  password: string;
}
