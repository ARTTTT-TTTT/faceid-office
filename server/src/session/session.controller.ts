import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { StartSessionDto } from '@/session/dto/start-session.dto';
import { SessionService } from '@/session/session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  async startSession(@Body() startSessionDto: StartSessionDto): Promise<any> {
    return this.sessionService.startSession(startSessionDto);
  }

  @Delete('end/:sessionId')
  async endSession(@Param('sessionId') sessionId: string) {
    return this.sessionService.endSession(sessionId);
  }

  @Get()
  async getAll(@Param('cameraId') cameraId: string) {
    return this.sessionService.getSessions(cameraId);
  }
}
