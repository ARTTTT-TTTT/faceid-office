import { IsInt, IsPositive, Min } from 'class-validator';

export class UpdateSessionDurationDto {
  @IsPositive({ message: 'Session duration must be a positive number' })
  @IsInt({ message: 'Session duration must be an integer' })
  @Min(1, { message: 'Session duration must be at least 1 second' })
  sessionDuration: number;
}
