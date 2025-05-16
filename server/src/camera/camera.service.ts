import { Injectable } from '@nestjs/common';

@Injectable()
export class CameraService {
  create() {
    return 'This action adds a new camera';
  }

  findAll() {
    return `This action returns all camera`;
  }

  findOne(id: number) {
    return `This action returns a #${id} camera`;
  }

  update(id: number) {
    return `This action updates a #${id} camera`;
  }

  remove(id: number) {
    return `This action removes a #${id} camera`;
  }
}
