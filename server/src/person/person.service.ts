import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  create(createPersonDto: CreatePersonDto) {
    // Example usage: return the received DTO
    return `This action adds a new person: ${JSON.stringify(createPersonDto)}`;
  }

  findAll() {
    return `This action returns all person`;
  }

  findOne(id: number) {
    return `This action returns a #${id} person`;
  }

  update(id: number, updatePersonDto: UpdatePersonDto) {
    return `This action updates a #${id} person with data: ${JSON.stringify(updatePersonDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} person`;
  }
}
