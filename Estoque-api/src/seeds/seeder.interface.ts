import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';

export interface Seeder {
    track?: boolean;
    run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any>;
}

