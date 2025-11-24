import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class EnderecosPopulation1763470517003 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Verifica se já existem endereços para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.enderecos 
            WHERE (logradouro, numero, id_municipio) IN (
                ('Avenida Principal', '100', 5547),
                ('Rua das Flores', '250', 5418),
                ('Avenida Comercial', '1234', 5342),
                ('Rodovia BR-153', 'Km 5', 5342),
                ('Avenida Industrial', '5678', 5556)
            );
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem todos os endereços, não precisa inserir
        if (existingCount >= 5) {
            console.log('Endereços já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.enderecos (logradouro, numero, complemento, id_municipio)
            SELECT * FROM (VALUES
              ('Avenida Principal', '100', 'Sala 1', 5547),
              ('Rua das Flores', '250', NULL, 5418),
              ('Avenida Comercial', '1234', 'Galpão A', 5342),
              ('Rodovia BR-153', 'Km 5', 'Lote 2', 5342),
              ('Avenida Industrial', '5678', NULL, 5556)
            ) AS v(logradouro, numero, complemento, id_municipio)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.enderecos e 
                WHERE e.logradouro = v.logradouro 
                AND e.numero = v.numero 
                AND e.id_municipio = v.id_municipio
            );
        `);
    }
}

