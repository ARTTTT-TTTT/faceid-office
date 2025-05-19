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

  async getFaceImages(adminId: string, personId: string) {
    const person = await this.prisma.person.findFirst({
      where: {
        id: personId,
        adminId, // Ensure the admin is authorized to view this person
      },
      select: {
        faceImageUrls: true,
      },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person.faceImageUrls;
  }

  async uploadMultipleFaceImages(
    files: Express.Multer.File[],
    adminId: string,
    personId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please upload at least one photo.');
    }

    const imagePaths: string[] = [];

    for (const file of files) {
      const imagePath = await this.saveImageToFileSystem(
        adminId,
        personId,
        file,
      );
      imagePaths.push(imagePath);
    }

    try {
      await this.prisma.person.update({
        where: { id: personId },
        data: {
          faceImageUrls: {
            push: imagePaths, // push array of new images
          },
        },
      });

      return {
        message: 'Success',
        uploaded: imagePaths.length,
        imageUrls: imagePaths,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update images: ' + error,
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

  async deleteFaceImage(adminId: string, personId: string, imageUrl: string) {
    const person = await this.prisma.person.findFirst({
      where: {
        id: personId,
        adminId,
      },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const updatedUrls = person.faceImageUrls.filter((url) => url !== imageUrl);

    if (updatedUrls.length === person.faceImageUrls.length) {
      throw new BadRequestException('Image URL not found in person records');
    }

    await this.prisma.person.update({
      where: { id: personId },
      data: {
        faceImageUrls: updatedUrls,
      },
    });

    // Try to delete the image from filesystem
    try {
      const imagePath = path.join(__dirname, '..', '..', '..', imageUrl);
      await fs.unlink(imagePath);
    } catch (error) {
      throw new InternalServerErrorException(error);
      // Do not block the operation if file deletion fails
    }

    return { message: 'Image deleted successfully' };
  }
}
