import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async createPerson(adminId: string, dto: CreatePersonDto) {
    const newPerson = await this.prisma.person.create({
      data: {
        fullName: dto.fullName,
        position: dto.position,
        profileImageUrl: dto.profileImageUrl, // Ensure this field is included
        admin: {
          connect: { id: adminId },
        },
      },
    });
    return newPerson;
  }
}
