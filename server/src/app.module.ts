import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { AiVectorModule } from './ai-vector/ai-vector.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CameraModule } from './camera/camera.module';
import { CommonModule } from './common/common.module';
import { DetectionLogModule } from './detection-log/detection-log.module';
import { PersonModule } from './person/person.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PersonModule,
    SessionModule,
    DetectionLogModule,
    AdminModule,
    CameraModule,
    CommonModule,
    AiVectorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
