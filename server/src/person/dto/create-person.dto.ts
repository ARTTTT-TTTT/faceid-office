import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  position?: string;
}
