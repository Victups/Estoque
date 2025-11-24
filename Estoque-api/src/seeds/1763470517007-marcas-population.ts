import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class MarcasPopulation1763470517007 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.marcas 
            WHERE nome IN ('Piracanjuba', 'Italac', 'Tio João', 'Camil', 'Coca-Cola', 'Sadia', 'Perdigão');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 7) {
            console.log('Marcas já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.marcas (nome)
            VALUES
              ('Piracanjuba'),
              ('Italac'),
              ('Tio João'),
              ('Camil'),
              ('Coca-Cola'),
              ('Sadia'),
              ('Perdigão')
            ON CONFLICT (nome) DO NOTHING;
        `);
    }
}

