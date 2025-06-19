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
import { UploadPersonFiles } from '@/common/decorators/file-upload.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { UpdatePersonDto } from '@/person/dto/update-person.dto';
import { PersonService } from '@/person/person.service';

@UseGuards(JwtAuthGuard)
@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  // * ========== CORE ===========

  @Post()
  @UploadPersonFiles(3)
  async createPerson(
    @GetUser('sub') adminId: string,
    @Body() createPersonDto: CreatePersonDto,
    @UploadedFiles()
    files: {
      profileImage: Express.Multer.File[];
      faceImages: Express.Multer.File[];
    },
  ) {
    const { profileImage, faceImages } = files;

    return this.personService.createPerson(
      adminId,
      createPersonDto,
      profileImage?.[0], // single file
      faceImages || [], // multiple files
    );
  }

  @Get()
  async getPeople(@GetUser('sub') adminId: string) {
    return this.personService.getPeople(adminId);
  }

  // * ========== OTHER ===========

  @Get(':personId')
  @CheckOwnership('person', 'personId')
  async getPerson(@Param('personId') personId: string) {
    return this.personService.getPerson(personId);
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
}
