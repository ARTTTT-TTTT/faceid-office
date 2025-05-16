import { Body, Controller, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateSessionDurationDto } from './dto/update-session-duration.dto';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('session-duration')
  updateSessionDuration(
    @Param('id') adminId: string,
    @Body() dto: UpdateSessionDurationDto,
  ) {
    return this.adminService.updateSessionDuration(
      adminId,
      dto.sessionDuration,
    );
  }
}
