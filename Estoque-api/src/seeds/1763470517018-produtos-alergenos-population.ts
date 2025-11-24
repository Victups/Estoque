import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class ProdutosAlergenosPopulation1763470517018 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.produtos_alergenos 
            WHERE nome IN (
                'Contém Lactose',
                'Contém proteínas do leite'
            );
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 3) {
            console.log('Produtos-alergenos já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.produtos_alergenos (id, nome)
            SELECT p.id, v.nome
            FROM public.produtos p
            JOIN LATERAL (
              VALUES
                ('PROD001', 'Contém Lactose'),
                ('PROD001', 'Contém proteínas do leite'),
                ('PROD002', 'Contém Lactose')
            ) AS v(codigo, nome) ON v.codigo = p.codigo
            WHERE NOT EXISTS (
                SELECT 1 FROM public.produtos_alergenos pa 
                WHERE pa.id = p.id 
                AND pa.nome = v.nome
            );
        `);
    }
}

