import { Body, Controller, Param, Post } from '@nestjs/common';

import { CreatePersonDto } from '@/person/dto/create-person.dto';
import { PersonService } from '@/person/person.service';

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
