import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Full name can only contain alphabetic characters (A-Z, a-z)',
  })
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
