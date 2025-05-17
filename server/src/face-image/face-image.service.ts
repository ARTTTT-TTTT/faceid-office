import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { UploadFaceImageDto } from '@/face-image/dto/upload-face-image.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FaceImageService {
  constructor(private readonly prisma: PrismaService) {}

  async getFaceImages(personId: string) {
    try {
      const faceImages = await this.prisma.faceImage.findMany({
        where: {
          personId: personId,
        },
      });

      if (!faceImages || faceImages.length === 0) {
        throw new NotFoundException(
          `No face images found for Person ID: ${personId}`,
        );
      }

      const images = faceImages.map(({ id, imageUrl, vectorUrl }) => ({
        id,
        imageUrl,
        vectorUrl,
      }));
      return images;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async uploadFaceImage(file: Express.Multer.File, dto: UploadFaceImageDto) {
    if (!file) {
      throw new BadRequestException('Please upload a photo of your face.');
    }

    // !ERROR กรณี personId ไม่มีตรงกับ person ใน database

    const imagePath = await this.saveImageToFileSystem(
      dto.adminId,
      dto.personId,
      file,
    );

    // ?FEATURE ปรับปรุงให้รับรูปภาพได้หลายรูป

    // !FEATURE เรียกใช้ api/ai (adminId, personId, imagePath) สำหรับเปลี่ยนภาพเป็น vector
    // !FEATURE ผลลัพธ์จาก api/ai จะได้ vectorPath ถ้าไม่ได้ throw error

    try {
      const faceImage = await this.prisma.faceImage.create({
        data: {
          personId: dto.personId,
          imageUrl: imagePath,
          vectorUrl: imagePath,
        },
      });

      return faceImage;
    } catch (error) {
      throw new InternalServerErrorException(error);
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
      const faceImage = await this.prisma.faceImage.findUnique({
        where: {
          id: faceImageId,
        },
      });

      if (!faceImage) {
        throw new NotFoundException(
          `No face image found with ID: ${faceImageId}`,
        );
      }

      await this.prisma.faceImage.delete({
        where: {
          id: faceImageId,
        },
      });

      const imagePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        faceImage.imageUrl,
      );
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
