import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class LocalizacoesPopulation1763470517010 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.localizacoes 
            WHERE (corredor, prateleira, secao) IN (
                ('A1', 'P1', 'S1'),
                ('A2', 'P2', 'S1'),
                ('B1', 'P1', 'S1'),
                ('B2', 'P2', 'S2')
            );
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 4) {
            console.log('Localizações já existem, pulando seed...');
            return;
        }

                const depositos = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.depositos 
            WHERE nome IN ('Depósito Central', 'Depósito de Refrigerados')
            ORDER BY nome, id;
        `);

        const depositoMap = new Map<string, number | null>();
        depositos.forEach((deposito: any) => {
            depositoMap.set(deposito.nome, deposito.id);
        });

        const depositoCentralId = depositoMap.get('Depósito Central') || 'NULL';
        const depositoRefrigeradosId = depositoMap.get('Depósito de Refrigerados') || 'NULL';

        await dataSource.query(`
            INSERT INTO public.localizacoes (id_deposito, corredor, prateleira, secao)
            SELECT * FROM (VALUES
              (${depositoCentralId}, 'A1', 'P1', 'S1'),
              (${depositoCentralId}, 'A2', 'P2', 'S1'),
              (${depositoRefrigeradosId}, 'B1', 'P1', 'S1'),
              (${depositoRefrigeradosId}, 'B2', 'P2', 'S2')
            ) AS v(id_deposito, corredor, prateleira, secao)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.localizacoes l 
                WHERE l.corredor = v.corredor 
                AND l.prateleira = v.prateleira 
                AND l.secao = v.secao
            );
        `);
    }
}

