import { Module } from '@nestjs/common';

import { OwnershipGuard } from '@/common/guards/ownership.guard';

@Module({
  providers: [OwnershipGuard],
  exports: [OwnershipGuard],
})
export class CommonModule {}
