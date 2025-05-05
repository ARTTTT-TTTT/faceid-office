import { DataSourceOptions } from 'typeorm';

export const pgConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: true,
  synchronize: false, // or true in development
  entities: ['dist/**/*.entity.js'], // adjust to your build
  migrations: ['dist/migrations/*.js'], // if you're using migrations
};
