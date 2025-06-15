import { Module } from '@nestjs/common';

import { AiVectorModule } from '@/ai-vector/ai-vector.module';
import { FaceImageModule } from '@/face-image/face-image.module';
import { PersonController } from '@/person/person.controller';
import { PersonService } from '@/person/person.service';

@Module({
  imports: [FaceImageModule, AiVectorModule],
  controllers: [PersonController],
  providers: [PersonService],
})
export class PersonModule {}
