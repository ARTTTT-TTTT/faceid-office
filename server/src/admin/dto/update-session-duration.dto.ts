import { IsInt, IsPositive, Min } from 'class-validator';

export class UpdateSessionDurationDto {
  @IsPositive({ message: 'Session duration must be a positive number' })
  @IsInt({ message: 'Session duration must be an integer' })
  @Min(60)
  sessionDuration: number; // in seconds
}
