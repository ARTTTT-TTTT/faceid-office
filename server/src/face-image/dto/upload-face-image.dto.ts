import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFaceImageDto {
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @IsNotEmpty()
  @IsString()
  personId: string;
}
