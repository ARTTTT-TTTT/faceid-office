import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CheckOwnership } from '@/common/decorators/check-ownership.decorator';
import { UploadImageFiles } from '@/common/decorators/file-upload.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { DeleteFaceImageDto } from '@/face-image/dto/delete-face-image.dto';
import { FaceImageService } from '@/face-image/face-image.service';
import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { UpdatePersonDto } from '@/person/dto/update-person.dto';
import { PersonService } from '@/person/person.service';

@UseGuards(JwtAuthGuard)
@Controller('people')
export class PersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly faceImageService: FaceImageService,
  ) {}

  @Get()
  async getPeople(@GetUser('sub') adminId: string) {
    return this.personService.getPeople(adminId);
  }

  @Get(':personId')
  @CheckOwnership('person', 'personId')
  async getPerson(@Param('personId') personId: string) {
    return this.personService.getPerson(personId);
  }

  @Post()
  async create(
    @GetUser('sub') adminId: string,
    @Body() createPersonDto: CreatePersonDto,
  ) {
    return this.personService.createPerson(adminId, createPersonDto);
  }

  @Patch(':personId')
  @CheckOwnership('person', 'personId')
  async updatePerson(
    @Param('personId') personId: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personService.updatePerson(personId, updatePersonDto);
  }

  @Delete(':personId')
  @CheckOwnership('person', 'personId')
  async deletePerson(@Param('personId') personId: string) {
    return this.personService.deletePerson(personId);
  }

  @Get(':personId/face-images')
  @CheckOwnership('person', 'personId')
  async getFaceImages(@Param('personId') personId: string) {
    return this.faceImageService.getFaceImages(personId);
  }

  @Post(':personId/face-images')
  @CheckOwnership('person', 'personId')
  @UploadImageFiles('faceImages')
  async uploadFaceImages(
    @GetUser('sub') adminId: string,
    @Param('personId') personId: string,
    @UploadedFiles() faceImages: Express.Multer.File[],
  ) {
    return this.faceImageService.uploadMultipleFaceImages(
      faceImages,
      adminId,
      personId,
    );
  }

  @Delete(':personId/face-images')
  @CheckOwnership('person', 'personId')
  async deleteFaceImages(
    @Param('personId') personId: string,
    @Body() deleteFaceImageDto: DeleteFaceImageDto,
  ) {
    return this.faceImageService.deleteFaceImages(personId, deleteFaceImageDto);
  }
}
