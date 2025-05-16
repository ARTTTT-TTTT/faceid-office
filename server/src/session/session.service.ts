import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  create(createSessionDto: CreateSessionDto) {
    // Example usage: return the DTO or process it as needed
    return `This action adds a new session with data: ${JSON.stringify(createSessionDto)}`;
  }

  findAll() {
    return `This action returns all session`;
  }

  findOne(id: number) {
    return `This action returns a #${id} session`;
  }

  update(id: number, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session with data: ${JSON.stringify(updateSessionDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
