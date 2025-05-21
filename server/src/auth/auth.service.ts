import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const existingEmail = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already taken');
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        name: username,
        email,
        passwordHash: hashed,
      },
    });

    return admin;
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
