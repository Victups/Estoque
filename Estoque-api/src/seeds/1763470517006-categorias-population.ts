import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class CategoriasPopulation1763470517006 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.categorias 
            WHERE nome IN ('Laticínios', 'Grãos e Cereais', 'Bebidas', 'Mercearia', 'Frios e Embutidos');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 5) {
            console.log('Categorias já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.categorias (nome)
            VALUES
              ('Laticínios'),
              ('Grãos e Cereais'),
              ('Bebidas'),
              ('Mercearia'),
              ('Frios e Embutidos')
            ON CONFLICT (nome) DO NOTHING;
        `);
    }
}

