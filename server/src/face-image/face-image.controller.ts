import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FaceImageService } from './face-image.service';
import { CreateFaceImageDto } from './dto/create-face-image.dto';
import { UpdateFaceImageDto } from './dto/update-face-image.dto';

@Controller('face-image')
export class FaceImageController {
  constructor(private readonly faceImageService: FaceImageService) {}

  @Post()
  create(@Body() createFaceImageDto: CreateFaceImageDto) {
    return this.faceImageService.create(createFaceImageDto);
  }

  @Get()
  findAll() {
    return this.faceImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faceImageService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFaceImageDto: UpdateFaceImageDto,
  ) {
    return this.faceImageService.update(+id, updateFaceImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faceImageService.remove(+id);
  }
}
