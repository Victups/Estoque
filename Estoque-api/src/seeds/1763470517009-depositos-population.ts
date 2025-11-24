import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class DepositosPopulation1763470517009 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Buscar IDs dos endereços primeiro para evitar erro de subquery retornando múltiplas linhas
        // Usando DISTINCT ON para garantir apenas um resultado por combinação de logradouro e numero
        const enderecos = await dataSource.query(`
            SELECT DISTINCT ON (logradouro, numero) id, logradouro, numero 
            FROM public.enderecos 
            WHERE (logradouro = 'Avenida Principal' AND numero = '100')
               OR (logradouro = 'Rua das Flores' AND numero = '250')
            ORDER BY logradouro, numero, id;
        `);

        // Criar mapa de endereço para ID
        const enderecoMap = new Map<string, number | null>();
        enderecos.forEach((endereco: any) => {
            const key = `${endereco.logradouro}_${endereco.numero}`;
            enderecoMap.set(key, endereco.id);
        });

        // Se não encontrou os endereços, apenas loga um aviso
        // Os endereços devem ser criados pelo seed anterior (1763470517003-enderecos-population.ts)
        if (enderecos.length === 0) {
            console.warn('Endereços não encontrados. Certifique-se de que o seed de endereços foi executado antes.');
        }

        const depositoCentralId = enderecoMap.get('Avenida Principal_100') || null;
        const depositoRefrigeradosId = enderecoMap.get('Rua das Flores_250') || null;

        // Inserir depósitos usando os IDs obtidos (usando NULL se não encontrado)
        const depositoCentralIdValue = depositoCentralId ? depositoCentralId : 'NULL';
        const depositoRefrigeradosIdValue = depositoRefrigeradosId ? depositoRefrigeradosId : 'NULL';

        // Verifica se já existem depósitos para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.depositos 
            WHERE nome IN ('Depósito Central', 'Depósito de Refrigerados');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem todos os depósitos, não precisa inserir
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

