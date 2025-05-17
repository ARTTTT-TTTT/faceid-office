import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFaceImageDto {
  @IsNotEmpty()
  @IsString()
  faceImageId: string;
}
