import { URL } from 'url';

type Environment = 'local' | 'staging' | 'production';

class Settings {
  ENVIRONMENT: Environment = (process.env.ENVIRONMENT ||
    'local') as Environment;
  API_STR: string = process.env.API_STR || '/api';
  SECRET_KEY: string = this.generateSecretKey();
  ACCESS_TOKEN_EXPIRE_MINUTES: number =
    Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 11520;
  FRONTEND_HOST: string = process.env.FRONTEND_HOST || 'http://localhost:3000';
  BACKEND_CORS_ORIGINS: (URL | string)[] | string =
    process.env.BACKEND_CORS_ORIGINS || [];

  POSTGRESQL_URL: string = process.env.POSTGRESQL_URL || '';

  REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
  REDIS_PORT: number = Number(process.env.REDIS_PORT) || 6379;

  private generateSecretKey(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  get allCorsOrigins(): string[] {
    let origins: string[] = [];
    if (typeof this.BACKEND_CORS_ORIGINS === 'string') {
      origins = this.BACKEND_CORS_ORIGINS.split(',').concat([
        this.FRONTEND_HOST,
      ]);
    } else {
      origins = this.BACKEND_CORS_ORIGINS.map((origin) =>
        typeof origin === 'string' ? origin : origin.toString(),
      ).concat([this.FRONTEND_HOST]);
    }
    return origins;
  }
}

export const settings = new Settings();
