import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class DepositosPopulation1763470517009 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const enderecos = await dataSource.query(`
            SELECT DISTINCT ON (logradouro, numero) id, logradouro, numero 
            FROM public.enderecos 
            WHERE (logradouro = 'Avenida Principal' AND numero = '100')
               OR (logradouro = 'Rua das Flores' AND numero = '250')
            ORDER BY logradouro, numero, id;
        `);

        const enderecoMap = new Map<string, number | null>();
        enderecos.forEach((endereco: any) => {
            const key = `${endereco.logradouro}_${endereco.numero}`;
            enderecoMap.set(key, endereco.id);
        });

        if (enderecos.length === 0) {
            console.warn('Endereços não encontrados. Certifique-se de que o seed de endereços foi executado antes.');
        }

        const depositoCentralId = enderecoMap.get('Avenida Principal_100') || null;
        const depositoRefrigeradosId = enderecoMap.get('Rua das Flores_250') || null;

        const depositoCentralIdValue = depositoCentralId ? depositoCentralId : 'NULL';
        const depositoRefrigeradosIdValue = depositoRefrigeradosId ? depositoRefrigeradosId : 'NULL';

        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.depositos 
            WHERE nome IN ('Depósito Central', 'Depósito de Refrigerados');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        if (existingCount >= 2) {
            console.log('Depósitos já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.depositos (nome, id_endereco)
            VALUES
              ('Depósito Central', ${depositoCentralIdValue}),
              ('Depósito de Refrigerados', ${depositoRefrigeradosIdValue})
            ON CONFLICT (nome) DO NOTHING;
        `);
    }
}

