import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [PrismaModule],
})
export class PersonModule {}
