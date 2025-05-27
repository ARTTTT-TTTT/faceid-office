import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDetectionLogDto {
  @IsNotEmpty()
  @IsUUID()
  personId: string;

  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}
