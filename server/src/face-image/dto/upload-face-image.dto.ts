import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UploadFaceImageDto {
  @IsNotEmpty()
  @IsString()
  adminId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  personId: string;
}
