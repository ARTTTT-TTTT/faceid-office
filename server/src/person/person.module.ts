import { Module } from '@nestjs/common';

import { FaceImageModule } from '@/face-image/face-image.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  imports: [PrismaModule, FaceImageModule],
})
export class PersonModule {}
