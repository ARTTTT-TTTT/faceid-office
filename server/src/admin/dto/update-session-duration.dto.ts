import { IsInt, IsPositive, Min } from 'class-validator';

export class UpdateSessionDurationDto {
  @IsPositive()
  @IsInt()
  @Min(1)
  sessionDuration: number;
}
