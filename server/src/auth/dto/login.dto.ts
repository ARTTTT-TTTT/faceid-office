import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  @IsString()
  password: string;
}
