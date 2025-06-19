import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { AiVectorService } from '@/ai-vector/ai-vector.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly aiVectorService: AiVectorService,
  ) {}

  // * ========== CORE ===========

  async register(email: string, name: string, password: string) {
    // TODO: ถ้าเกิด error ให้ลบ vector และ admin_id ที่ save ไปแล้ว
    const existingEmail = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already taken');
    }

    // * Create admin
    const hashed = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        name,
        email,
        passwordHash: hashed,
      },
    });

    try {
      await this.aiVectorService.buildEmptyVectors(admin.id);
    } catch (error) {
      if (admin.id) {
        await this.prisma.admin.delete({
          where: { id: admin.id },
        });

        // await this.aiVectorService.deleteVectors(admin.id);
      }
      this.logger.error(
        'Error during admin registration or vector creation:',
        error,
      );
      throw new InternalServerErrorException(
        'Error during admin registration or vector creation:',
      );
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };
  }

  async login(email: string, password: string) {
    const admin: Admin | null = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) throw new UnauthorizedException('Admin not found');

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
    });

    return { access_token: token };
  }
}
