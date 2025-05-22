import { Module } from '@nestjs/common';

import { FaceImageModule } from '@/face-image/face-image.module';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  imports: [FaceImageModule],
  controllers: [PersonController],
  providers: [PersonService],
})
export class PersonModule {}
