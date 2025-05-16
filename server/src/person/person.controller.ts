import { Controller, Post, Body, Param } from '@nestjs/common';
import { PersonService } from '@/person/person.service';
import { CreatePersonDto } from '@/person/dto/create-person.dto';

@Controller('people/:adminId')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  async create(
    @Param('adminId') adminId: string,
    @Body() createPersonDto: CreatePersonDto,
  ) {
    return this.personService.createPerson(adminId, createPersonDto);
  }
}
