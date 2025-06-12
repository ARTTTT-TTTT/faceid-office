import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Position } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { AiVectorService } from '@/ai-vector/ai-vector.service';
import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { UpdatePersonDto } from '@/person/dto/update-person.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PersonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiVectorService: AiVectorService,
  ) {}

  async createPerson(
    adminId: string,
    dto: CreatePersonDto,
    profileImage: Express.Multer.File,
    faceImages: Express.Multer.File[],
  ) {
    // TODO: ไม่เจอ adminId แล้วขึ้น error 500?
    // TODO: ถ้าเกิด error ให้ลบ profileImage, faceImages, vector, ที่ save ไปแล้ว
    // !Check if admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    // * Create person
    const newPerson = await this.prisma.person.create({
      data: {
        fullName: dto.fullName,
        position: dto.position as Position,
        profileImagePath: '',
        faceImagePaths: [],
        admin: {
          connect: { id: adminId },
        },
      },
    });

    // * Save images
    let profileImagePath: string | undefined;
    if (profileImage) {
      profileImagePath = await this.saveProfileImageToFileSystem(
        adminId,
        newPerson.id,
        profileImage,
      );
    }

    let faceImagePaths: string[] | undefined;
    if (faceImages.length > 0) {
      faceImagePaths = await Promise.all(
        faceImages.map((image) =>
          this.saveFaceImageToFileSystem(adminId, newPerson.id, image),
        ),
      );
    }

    // * Update person with image paths
    const person = await this.prisma.person.update({
      where: { id: newPerson.id },
      data: {
        profileImagePath,
        faceImagePaths,
      },
    });

    // * Update person vectors in AI service
    await this.aiVectorService.updatePersonVectors(adminId, newPerson.id);

    return person;
  }

  private async saveProfileImageToFileSystem(
    adminId: string,
    personId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const storageDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'storage',
        adminId,
        'profile-images',
      );

      await fs.mkdir(storageDir, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const newFilename = `${personId}${fileExtension}`;
      const filePath = path.join(storageDir, newFilename);

      await fs.writeFile(filePath, file.buffer);

      return `/storage/${adminId}/profile-images/${newFilename}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save profile image in file system: ' + error,
      );
    }
  }

  private async saveFaceImageToFileSystem(
    adminId: string,
    personId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const storageDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'storage',
        adminId,
        'face-images',
        personId,
      );

      await fs.mkdir(storageDir, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const newFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(storageDir, newFilename);

      await fs.writeFile(filePath, file.buffer);

      return `/storage/${adminId}/face_images/${personId}/${newFilename}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save face image in file system: ' + error,
      );
    }
  }

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

    return { message: 'Person deleted' };
  }
}
