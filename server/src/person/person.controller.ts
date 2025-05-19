import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { UploadImageFile } from '@/common/decorators/file-upload.decorator';
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
  @UploadImageFile()
  async uploadFaceImage(
    @GetUser('sub') adminId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.faceImageService.uploadFaceImage(file, adminId, personId);
  }
}
