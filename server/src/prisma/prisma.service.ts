/* eslint-disable no-console */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('🚀 Connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🚀 Disconnected to PostgreSQL');
  }
}
