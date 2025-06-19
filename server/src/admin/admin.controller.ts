import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { AdminService } from '@/admin/admin.service';
import { UpdateSessionDurationDto } from '@/admin/dto/update-session-duration.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // * ========== CORE ===========

  @Get('settings')
  async getSettings(@GetUser('sub') adminId: string) {
    return this.adminService.getSettings(adminId);
  }

  @Patch('session-duration')
  updateSessionDuration(
    @GetUser('sub') adminId: string,
    @Body() dto: UpdateSessionDurationDto,
  ) {
    return this.adminService.updateSessionDuration(adminId, dto);
  }

  // * ========== OTHER ===========

  @Get('profile')
  async getProfile(@GetUser('sub') adminId: string) {
    return this.adminService.getProfile(adminId);
  }

  @Get('session-duration')
  async getSessionDuration(@GetUser('sub') adminId: string): Promise<number> {
    return this.adminService.getSessionDuration(adminId);
  }
}
