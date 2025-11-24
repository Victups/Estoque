import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
const {
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '5432',
  DATABASE_USER = 'postgres',
  DATABASE_PASSWORD = 'admin',
  DATABASE_NAME = 'produto',
  DATABASE_SYNCHRONIZE = 'false',
} = process.env;

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: DATABASE_HOST,
  port: Number(DATABASE_PORT),
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  synchronize: DATABASE_SYNCHRONIZE === 'true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  seeds :   [__dirname + '/../seeds/*{.ts,.js}'],
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSourceOptions,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
