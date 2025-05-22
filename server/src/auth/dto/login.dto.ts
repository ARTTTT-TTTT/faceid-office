import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
