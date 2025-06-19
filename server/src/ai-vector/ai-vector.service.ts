import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiVectorService {
  private readonly AI_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.AI_URL = this.configService.get<string>('AI_URL');

    if (!this.AI_URL) {
      throw new Error('AI_URL is not defined in configuration.');
    }
  }

  // * ========== CORE ===========

  async buildEmptyVectors(adminId: string) {
    try {
      const url = `${this.AI_URL}/vectors/${adminId}/build/empty`;
      const response = await lastValueFrom(this.httpService.post(url, {}));
      return response;
    } catch {
      throw new InternalServerErrorException(
        'Failed to initialize AI vectors.',
      );
    }
  }

  async updatePersonVectors(adminId: string, personId: string) {
    try {
      const url = `${this.AI_URL}/vectors/${adminId}/person/${personId}`;
      const response = await lastValueFrom(this.httpService.put(url, {}));
      return response;
    } catch {
      throw new InternalServerErrorException(
        'Failed to update AI vectors for person.',
      );
    }
  }

  async deletePersonVectors(adminId: string, personId: string) {
    try {
      const url = `${this.AI_URL}/vectors/${adminId}/person/${personId}`;
      const response = await lastValueFrom(this.httpService.delete(url));
      return response;
    } catch {
      throw new InternalServerErrorException(
        'Failed to delete AI vectors for person.',
      );
    }
  }

  async deleteVectors(adminId: string) {
    try {
      const url = `${this.AI_URL}/vectors/${adminId}}`;
      const response = await lastValueFrom(this.httpService.delete(url));
      return response;
    } catch {
      throw new InternalServerErrorException(
        `Failed to delete AI vectors for adminId: ${adminId}`,
      );
    }
  }
}
