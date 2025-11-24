import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database.module';

export default new DataSource({
  ...dataSourceOptions,
});

