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
    console.log('Fetching profile for admin:', adminId);
    return this.adminService.getProfile(adminId);
  }

  @Get('session-duration')
  async getSessionDuration(@GetUser('sub') adminId: string): Promise<number> {
    return this.adminService.getSessionDuration(adminId);
  }

  @Patch('session-duration')
  updateSessionDuration(
    @GetUser('sub') adminId: string,
    @Body() dto: UpdateSessionDurationDto,
  ) {
    return this.adminService.updateSessionDuration(adminId, dto);
  }
}
