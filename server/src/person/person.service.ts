import { Injectable } from '@nestjs/common';
import { Position } from '@prisma/client';

import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { UpdatePersonDto } from '@/person/dto/update-person.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async getPeople(adminId: string) {
    const people = await this.prisma.person.findMany({
      where: {
        adminId,
      },
    });
    return people;
  }

  async getPerson(personId: string) {
    const person = await this.prisma.person.findFirst({
      where: {
        id: personId,
      },
    });

    return person;
  }

  async createPerson(adminId: string, dto: CreatePersonDto) {
    const newPerson = await this.prisma.person.create({
      data: {
        fullName: dto.fullName,
        position: dto.position as any as Position,
        profileImageUrl: dto.profileImageUrl,
        admin: {
          connect: { id: adminId },
        },
      },
    });
    return newPerson;
  }

  async updatePerson(personId: string, dto: UpdatePersonDto) {
    const person = await this.prisma.person.update({
      where: { id: personId },
      data: {
        fullName: dto.fullName,
        position: dto.position as Position,
      },
    });

    return person;
  }

  async deletePerson(personId: string) {
    await this.prisma.person.delete({
      where: { id: personId },
    });

    return { message: 'Delete success' };
  }
}
