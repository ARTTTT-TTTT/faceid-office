import { Injectable } from '@nestjs/common';
import { CreateFaceImageDto } from './dto/create-face-image.dto';
import { UpdateFaceImageDto } from './dto/update-face-image.dto';

@Injectable()
export class FaceImageService {
  create(createFaceImageDto: CreateFaceImageDto) {
    // Example usage: return the DTO or process it as needed
    return `This action adds a new faceImage with data: ${JSON.stringify(createFaceImageDto)}`;
  }

  findAll() {
    return `This action returns all faceImage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faceImage`;
  }

  update(id: number, updateFaceImageDto: UpdateFaceImageDto) {
    return `This action updates a #${id} faceImage with data: ${JSON.stringify(updateFaceImageDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} faceImage`;
  }
}
