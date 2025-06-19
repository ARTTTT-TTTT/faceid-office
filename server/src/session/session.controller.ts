import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
// import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { SessionService } from '@/session/session.service';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // * ========== CORE ===========

  @Post('start')
  async startSession(@GetUser('sub') adminId: string) {
    return this.sessionService.startSession(adminId);
  }

  // TODO: CheckOwnership มีปัญหา
  // @CheckOwnership('session', 'sessionId')
  @Delete(':sessionId/end')
  async endSession(
    @GetUser('sub') adminId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionService.endSession(adminId, sessionId);
  }

  @Get('status')
  async getSessionStatus(@GetUser('sub') adminId: string) {
    return this.sessionService.getSessionStatus(adminId);
  }
}
