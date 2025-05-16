import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FaceImageModule } from './face-image/face-image.module';
import { SessionModule } from './session/session.module';
import { DetectionLogModule } from './detection-log/detection-log.module';

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
