import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { SessionService } from '@/session/session.service';

import { StartSessionResult } from './session.interface';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  async startSession(
    @GetUser('sub') adminId: string,
  ): Promise<StartSessionResult> {
    return this.sessionService.startSession(adminId);
  }

  @Delete('end')
  async endSession(@GetUser('sub') adminId: string) {
    return this.sessionService.endSession(adminId);
  }

  @Get()
  async getAll(@Param('cameraId') cameraId: string) {
    return this.sessionService.getSessions(cameraId);
  }
  @Get('status')
  async getSessionStatus(@GetUser('sub') adminId: string) {
    return this.sessionService.getSessionStatus(adminId);
  }
}
