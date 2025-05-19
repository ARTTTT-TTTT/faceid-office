import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FaceImageService {
  constructor(private readonly prisma: PrismaService) {}

  async getFaceImages(personId: string) {
    try {
      const faceImages = await this.prisma.person.findMany({
        where: {
          id: personId,
        },
      });

      if (!faceImages || faceImages.length === 0) {
        throw new NotFoundException(
          `No face images found for Person ID: ${personId}`,
        );
      }

      // const images = faceImages.map(({ id, faceImageUrl }) => ({
      //   id,
      //   faceImageUrl,
      // }));
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async uploadFaceImage(
    file: Express.Multer.File,
    adminId: string,
    personId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a photo of your face.');
    }

    // Check if the person exists
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found.');
    }

    const imagePath = await this.saveImageToFileSystem(adminId, personId, file);

    try {
      await this.prisma.person.update({
        where: { id: personId },
        data: {
          faceImageUrls: {
            push: imagePath,
          },
        },
      });
      return { message: 'Success', imageUrl: imagePath };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update image :' + error,
      );
    }
  }

  private async saveImageToFileSystem(
    adminId: string,
    personId: string,
    file: Express.Multer.File,
  ): Promise<string | null> {
    try {
      const storageDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'storage',
        'face_images',
        adminId,
        personId,
      );

      await fs.mkdir(storageDir, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const newFilename = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(storageDir, newFilename);

      await fs.writeFile(filePath, file.buffer);

      const imageUrl = `storage/face_images/${adminId}/${personId}/${newFilename}`;

      return imageUrl;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteFaceImage(faceImageId: string) {
    try {
      const faceImage = await this.prisma.person.findUnique({
        where: {
          id: faceImageId,
        },
      });

      if (!faceImage) {
        throw new NotFoundException(
          `No face image found with ID: ${faceImageId}`,
        );
      }

      await this.prisma.person.delete({
        where: {
          id: faceImageId,
        },
      });

      const imagePath = path.join(__dirname, '..', '..', '..', '..', 'storage');
      await fs.unlink(imagePath);

      // const vectorPath = path.join(
      //   __dirname,
      //   '..',
      //   '..',
      //   '..',
      //   '..',
      //   faceImage.vectorUrl,
      // );
      // await fs.unlink(vectorPath);

      return { id: faceImageId };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
