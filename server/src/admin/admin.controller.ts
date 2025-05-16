import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateSessionDurationDto } from './dto/update-session-duration.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  async getProfile(@GetUser('sub') adminId: string) {
    return this.adminService.getProfile(adminId);
  }

  @Patch('session-duration')
  updateSessionDuration(
    @GetUser('sub') adminId: string,
    @Body() dto: UpdateSessionDurationDto,
  ) {
    return this.adminService.updateSessionDuration(
      adminId,
      dto.sessionDuration,
    );
  }
}
