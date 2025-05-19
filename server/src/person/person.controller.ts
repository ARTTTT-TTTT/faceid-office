import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { UploadImageFiles } from '@/common/decorators/file-upload.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { FaceImageService } from '@/face-image/face-image.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { PersonService } from './person.service';

@UseGuards(JwtAuthGuard)
@Controller('people')
export class PersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly faceImageService: FaceImageService,
  ) {}

  @Post()
  async create(
    @GetUser('sub') adminId: string,
    @Body() createPersonDto: CreatePersonDto,
  ) {
    return this.personService.createPerson(adminId, createPersonDto);
  }

  @Post(':personId/face-image')
  @CheckOwnership('person', 'personId')
  @UploadImageFiles('images') // Accepts up to 5 images
  async uploadFaceImages(
    @GetUser('sub') adminId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.faceImageService.uploadMultipleFaceImages(
      files,
      adminId,
      personId,
    );
  }

  @Get(':personId/face-image')
  async getFaceImages(
    @GetUser('sub') adminId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    return this.faceImageService.getFaceImages(adminId, personId);
  }

  @Delete(':personId/face-image')
  async deleteFaceImage(
    @GetUser('sub') adminId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Body('faceImageUrl') imageUrl: string,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('imageUrl is required in the request body');
    }

    return this.faceImageService.deleteFaceImage(adminId, personId, imageUrl);
  }
}
