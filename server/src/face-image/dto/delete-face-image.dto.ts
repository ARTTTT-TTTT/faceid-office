import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteFaceImageDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  faceImageUrls: string[];
}
