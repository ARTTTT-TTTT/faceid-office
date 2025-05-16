import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CameraModule } from './camera/camera.module';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, CameraModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
