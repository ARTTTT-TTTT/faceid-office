import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Matches(/^\S*$/, {
    message: 'Email cannot contain spaces',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^\S*$/, {
    message: 'Password cannot contain spaces',
  })
  password: string;
}
