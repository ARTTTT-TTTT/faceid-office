import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { DeleteFaceImageDto } from '@/face-image/dto/delete-face-image.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FaceImageService {
  constructor(private readonly prisma: PrismaService) {}

  async getFaceImages(personId: string) {
    try {
      const person = await this.prisma.person.findFirst({
        where: {
          id: personId,
        },
        select: {
          faceImagePaths: true,
        },
      });

      return { faceImagePaths: person.faceImagePaths };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload images: ' + error,
      );
    }
  }

  async uploadMultipleFaceImages(
    faceImages: Express.Multer.File[],
    adminId: string,
    personId: string,
  ) {
    if (!faceImages || faceImages.length === 0) {
      throw new BadRequestException('Please upload at least one photo.');
    }

    try {
      const faceImagePaths = await Promise.all(
        faceImages.map((image) =>
          this.saveImageToFileSystem(adminId, personId, image),
        ),
      );

      await this.prisma.person.update({
        where: { id: personId },
        data: {
          faceImagePaths: {
            push: faceImagePaths,
          },
        },
      });

      return {
        message: 'Success',
        faceImageUrls: faceImagePaths,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to upload images: ' + error,
      );
    }
  }

  private async saveImageToFileSystem(
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

      return `storage/face_images/${adminId}/${personId}/${newFilename}`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save image in file system: ' + error,
      );
    }
  }

  async deleteFaceImages(
    personId: string,
    deleteFaceImageDto: DeleteFaceImageDto,
  ) {
    try {
      await this.prisma.person.update({
        where: { id: personId },
        data: {
          faceImagePaths: deleteFaceImageDto.faceImageUrls,
        },
      });

      await Promise.all(
        deleteFaceImageDto.faceImageUrls.map((url) =>
          this.deleteImageFromFileSystem(url),
        ),
      );

      return { message: 'Success' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to delete images: ' + error,
      );
    }
  }

  private async deleteImageFromFileSystem(faceImageUrl: string) {
    try {
      const imagePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        faceImageUrl,
      );
      await fs.unlink(imagePath);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete image in file system: ' + error,
      );
    }
  }
}
