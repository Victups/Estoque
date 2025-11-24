import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class UfPopulation1763470517001 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Verifica se já existem UFs para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.uf WHERE sigla IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem todas as UFs (27 estados), não precisa inserir
        if (existingCount >= 27) {
            console.log('UFs já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.uf (id, sigla, nome) VALUES 
            (1, 'AC', 'Acre'),
            (2, 'AL', 'Alagoas'),
            (3, 'AP', 'Amapá'),
            (4, 'AM', 'Amazonas'),
            (5, 'BA', 'Bahia'),
            (6, 'CE', 'Ceará'),
            (7, 'DF', 'Distrito Federal'),
            (8, 'ES', 'Espírito Santo'),
            (9, 'GO', 'Goiás'),
            (10, 'MA', 'Maranhão'),
            (11, 'MT', 'Mato Grosso'),
            (12, 'MS', 'Mato Grosso do Sul'),
            (13, 'MG', 'Minas Gerais'),
            (14, 'PA', 'Pará'),
            (15, 'PB', 'Paraíba'),
            (16, 'PR', 'Paraná'),
            (17, 'PE', 'Pernambuco'),
            (18, 'PI', 'Piauí'),
            (19, 'RJ', 'Rio de Janeiro'),
            (20, 'RN', 'Rio Grande do Norte'),
            (21, 'RS', 'Rio Grande do Sul'),
            (22, 'RO', 'Rondônia'),
            (23, 'RR', 'Roraima'),
            (24, 'SC', 'Santa Catarina'),
            (25, 'SP', 'São Paulo'),
            (26, 'SE', 'Sergipe'),
            (27, 'TO', 'Tocantins')
            ON CONFLICT (sigla) DO NOTHING;
        `);
    }
}
