import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class RegistroMovimentacoesPopulation1763470517017 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Verifica se já existem registros de movimentações para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.registro_movimentacoes;
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem registros, não precisa inserir
        if (existingCount > 0) {
            console.log(`Já existem ${existingCount} registros de movimentações, pulando seed...`);
            return;
        }

        // Buscar IDs dos usuários primeiro
        const usuarios = await dataSource.query(`
            SELECT DISTINCT ON (email) id, email 
            FROM public.usuarios 
            WHERE email IN ('admin@sistema.com', 'maria.souza@empresa.com')
            ORDER BY email, id;
        `);

        const usuarioMap = new Map<string, number | null>();
        usuarios.forEach((usuario: any) => {
            usuarioMap.set(usuario.email, usuario.id);
        });

        const adminId = usuarioMap.get('admin@sistema.com') || 'NULL';
        const mariaId = usuarioMap.get('maria.souza@empresa.com') || 'NULL';

        await dataSource.query(`
            INSERT INTO public.registro_movimentacoes (
              id_lote,
              id_produto,
              id_usuario,
              valor_total,
              usuario_log_id,
              id_localizacao,
              quantidade,
              tipo_movimento,
              preco_unitario,
              observacao,
              id_localizacao_origem,
              id_localizacao_destino
            )
            SELECT
              l.id,
              p.id,
              ${mariaId},
              CASE WHEN m.tipo = 'entrada' THEN m.quantidade * COALESCE(l.custo_unitario, 0) ELSE NULL END,
              ${adminId},
              l.id_localizacao,
              m.quantidade,
              m.tipo::public.movimento_tipo_enum,
              CASE WHEN m.tipo = 'entrada' THEN l.custo_unitario ELSE 0 END,
              CASE m.tipo
                WHEN 'saida' THEN CASE p.codigo
                  WHEN 'PROD001' THEN 'Venda para mercado local'
                  WHEN 'PROD003' THEN 'Venda para restaurante'
                  WHEN 'PROD006' THEN 'Uso interno na padaria'
                  ELSE NULL
                END
                ELSE NULL
              END,
              CASE WHEN m.tipo = 'saida' THEN l.id_localizacao ELSE NULL END,
              CASE WHEN m.tipo = 'entrada' THEN l.id_localizacao ELSE NULL END
            FROM (
              VALUES
                ('PROD001', 'L001', 'entrada', 100.00),
                ('PROD002', 'L002', 'entrada', 80.00),
                ('PROD006', 'L003', 'entrada', 5000.00),
                ('PROD001', 'L004', 'entrada', 200.00),
                ('PROD003', 'L005', 'entrada', 300.00),
                ('PROD003', 'L006', 'entrada', 250.00),
                ('PROD004', 'L007', 'entrada', 400.00),
                ('PROD005', 'L008', 'entrada', 150.00),
                ('PROD001', 'L001', 'saida', 20.00),
                ('PROD003', 'L005', 'saida', 50.00),
                ('PROD006', 'L003', 'saida', 150.00)
            ) AS m(codigo, lote, tipo, quantidade)
            JOIN public.produtos p ON p.codigo = m.codigo
            JOIN public.produto_lotes l ON l.codigo_lote = m.lote AND l.id_produto = p.id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.registro_movimentacoes rm
                WHERE rm.id_lote = l.id
                AND rm.id_produto = p.id
                AND rm.quantidade = m.quantidade
                AND rm.tipo_movimento::text = m.tipo
            );
        `);
    }
}

