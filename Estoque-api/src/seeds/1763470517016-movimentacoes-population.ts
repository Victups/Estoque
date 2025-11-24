import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class MovimentacoesPopulation1763470517016 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Verifica se já existem movimentações para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.movimentacao_estoque;
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem movimentações, não precisa inserir
        if (existingCount > 0) {
            console.log(`Já existem ${existingCount} movimentações, pulando seed...`);
            return;
        }

        // Buscar ID do usuário admin primeiro
        const usuarios = await dataSource.query(`
            SELECT DISTINCT ON (email) id, email 
            FROM public.usuarios 
            WHERE email = 'admin@sistema.com'
            ORDER BY email, id
            LIMIT 1;
        `);

        const adminId = usuarios.length > 0 ? usuarios[0].id : 'NULL';

        await dataSource.query(`
            INSERT INTO public.movimentacao_estoque (id_produto, quantidade, data_mov, id_lote, tipo_movimento, created_by, updated_by)
            SELECT
              p.id,
              s.quantidade,
              CURRENT_TIMESTAMP,
              l.id,
              s.tipo::public.movimento_tipo_enum,
              ${adminId},
              ${adminId}
            FROM (
              VALUES
                ('PROD001', 100.00, 'L001', 'entrada'),
                ('PROD002', 80.00, 'L002', 'entrada'),
                ('PROD006', 5000.00, 'L003', 'entrada'),
                ('PROD001', 200.00, 'L004', 'entrada'),
                ('PROD003', 300.00, 'L005', 'entrada'),
                ('PROD003', 250.00, 'L006', 'entrada'),
                ('PROD004', 400.00, 'L007', 'entrada'),
                ('PROD005', 150.00, 'L008', 'entrada'),
                ('PROD001', 20.00, 'L001', 'saida'),
                ('PROD003', 50.00, 'L005', 'saida'),
                ('PROD006', 150.00, 'L003', 'saida')
            ) AS s(codigo, quantidade, lote, tipo)
            JOIN public.produtos p ON p.codigo = s.codigo
            JOIN public.produto_lotes l ON l.codigo_lote = s.lote AND l.id_produto = p.id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.movimentacao_estoque me
                WHERE me.id_produto = p.id
                AND me.id_lote = l.id
                AND me.quantidade = s.quantidade
                AND me.tipo_movimento::text = s.tipo
            );
        `);
    }
}

