import { Module } from '@nestjs/common';

import { AiVectorModule } from '@/ai-vector/ai-vector.module';
import { PersonController } from '@/person/person.controller';
import { PersonService } from '@/person/person.service';

@Module({
  imports: [AiVectorModule],
  controllers: [PersonController],
  providers: [PersonService],
})
export class PersonModule {}
