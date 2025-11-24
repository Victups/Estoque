import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class UnidadesPopulation1763470517008 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.unidade_medidas 
            WHERE descricao IN ('Unidade', 'Quilograma', 'Litro', 'Pacote', 'Caixa', 'Grama', 'Mililitro');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 7) {
            console.log('Unidades de medida já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.unidade_medidas (descricao, abreviacao)
            VALUES
              ('Unidade', 'un'),
              ('Quilograma', 'kg'),
              ('Litro', 'L'),
              ('Pacote', 'pac'),
              ('Caixa', 'cx'),
              ('Grama', 'g'),
              ('Mililitro', 'ml')
            ON CONFLICT (descricao) DO NOTHING;
        `);
    }
}

