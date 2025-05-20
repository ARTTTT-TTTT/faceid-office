import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { UpdatePersonDto } from '@/person/dto/update-person.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async getPeople(adminId: string) {
    try {
      const people = await this.prisma.person.findMany({
        where: {
          adminId,
        },
      });
      return people;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get people: ' + error);
    }
  }

  async getPerson(personId: string) {
    try {
      const person = await this.prisma.person.findFirst({
        where: {
          id: personId,
        },
      });

      return person;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get person: ' + error);
    }
  }

  async createPerson(adminId: string, dto: CreatePersonDto) {
    try {
      const newPerson = await this.prisma.person.create({
        data: {
          fullName: dto.fullName,
          position: dto.position,
          profileImageUrl: dto.profileImageUrl,
          admin: {
            connect: { id: adminId },
          },
        },
      });
      return newPerson;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create person: ' + error,
      );
    }
  }

  async updatePerson(personId: string, dto: UpdatePersonDto) {
    try {
      const person = await this.prisma.person.update({
        where: { id: personId },
        data: {
          fullName: dto.fullName,
          position: dto.position,
        },
      });

      return person;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update person: ' + error,
      );
    }
  }

  async deletePerson(personId: string) {
    try {
      await this.prisma.person.delete({
        where: { id: personId },
      });

      return { message: 'Success' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete person: ' + error,
      );
    }
  }
}
