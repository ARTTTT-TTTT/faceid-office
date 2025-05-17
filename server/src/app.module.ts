import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CameraModule } from './camera/camera.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, CameraModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
