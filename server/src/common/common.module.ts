import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  providers: [OwnershipGuard],
  exports: [OwnershipGuard],
})
export class CommonModule {}
