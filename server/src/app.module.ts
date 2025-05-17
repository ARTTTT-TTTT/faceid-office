import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CameraModule } from './camera/camera.module';
import { CommonModule } from './common/common.module';
import { DetectionLogModule } from './detection-log/detection-log.module';
import { FaceImageModule } from './face-image/face-image.module';
import { PersonModule } from './person/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PersonModule,
    FaceImageModule,
    SessionModule,
    DetectionLogModule,
    AdminModule,
    CameraModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
