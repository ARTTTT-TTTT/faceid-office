import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiVectorService } from '@/ai-vector/ai-vector.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AiVectorService],
  exports: [AiVectorService],
})
export class AiVectorModule {}
