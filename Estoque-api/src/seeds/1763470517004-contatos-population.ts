import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class ContatosPopulation1763470517004 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Verifica se já existem contatos para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.contatos 
            WHERE nome IN (
                'Admin Sys',
                'João Almoxarife',
                'Maria Gerente',
                'Distribuidora Alimentos GO',
                'Laticínios Centro-Oeste',
                'Frios Brasil S.A.'
            );
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem todos os contatos, não precisa inserir
        if (existingCount >= 6) {
            console.log('Contatos já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.contatos (nome, valor, tipo_contato, codigo_pais)
            SELECT * FROM (VALUES
              ('Admin Sys', 'admin@sistema.com', 'email', NULL),
              ('João Almoxarife', '62988776655', 'whatsapp', '55'),
              ('Maria Gerente', 'maria.gerente@empresa.com', 'email', NULL),
              ('Distribuidora Alimentos GO', 'contato@distribuidorago.com', 'email', NULL),
              ('Laticínios Centro-Oeste', '6232324545', 'telefone', '55'),
              ('Frios Brasil S.A.', 'vendas@friosbrasil.com', 'email', NULL)
            ) AS v(nome, valor, tipo_contato, codigo_pais)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.contatos c 
                WHERE c.nome = v.nome
            );
        `);
    }
}

