import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DetectionLogModule } from './detection-log/detection-log.module';
import { FaceImageModule } from './face-image/face-image.module';
import { PersonModule } from './person/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PersonModule,
    FaceImageModule,
    SessionModule,
    DetectionLogModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
