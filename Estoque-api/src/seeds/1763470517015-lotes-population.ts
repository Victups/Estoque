import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class LotesPopulation1763470517015 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const produtos = await dataSource.query(`
            SELECT DISTINCT ON (codigo) id, codigo 
            FROM public.produtos 
            WHERE codigo IN ('PROD001', 'PROD002', 'PROD003', 'PROD004', 'PROD005', 'PROD006')
            ORDER BY codigo, id;
        `);

        const usuarios = await dataSource.query(`
            SELECT DISTINCT ON (email) id, email 
            FROM public.usuarios 
            WHERE email IN ('joao.silva@empresa.com', 'maria.souza@empresa.com')
            ORDER BY email, id;
        `);

        const localizacoes = await dataSource.query(`
            SELECT DISTINCT ON (corredor) id, corredor 
            FROM public.localizacoes 
            WHERE corredor IN ('A1', 'A2', 'B1', 'B2')
            ORDER BY corredor, id;
        `);

        const produtoMap = new Map<string, number | null>();
        produtos.forEach((produto: any) => {
            produtoMap.set(produto.codigo, produto.id);
        });

        const usuarioMap = new Map<string, number | null>();
        usuarios.forEach((usuario: any) => {
            usuarioMap.set(usuario.email, usuario.id);
        });

        const localizacaoMap = new Map<string, number | null>();
        localizacoes.forEach((localizacao: any) => {
            localizacaoMap.set(localizacao.corredor, localizacao.id);
        });

        const prod1Id = produtoMap.get('PROD001') || 'NULL';
        const prod2Id = produtoMap.get('PROD002') || 'NULL';
        const prod3Id = produtoMap.get('PROD003') || 'NULL';
        const prod4Id = produtoMap.get('PROD004') || 'NULL';
        const prod5Id = produtoMap.get('PROD005') || 'NULL';
        const prod6Id = produtoMap.get('PROD006') || 'NULL';

        const joaoId = usuarioMap.get('joao.silva@empresa.com') || 'NULL';
        const mariaId = usuarioMap.get('maria.souza@empresa.com') || 'NULL';

        const a1Id = localizacaoMap.get('A1') || 'NULL';
        const a2Id = localizacaoMap.get('A2') || 'NULL';
        const b1Id = localizacaoMap.get('B1') || 'NULL';
        const b2Id = localizacaoMap.get('B2') || 'NULL';

        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.produto_lotes 
            WHERE codigo_lote IN ('L001', 'L002', 'L003', 'L004', 'L005', 'L006', 'L007', 'L008');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        if (existingCount >= 8) {
            console.log('Lotes já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.produto_lotes (id_produto, codigo_lote, data_validade, quantidade, data_entrada, responsavel_cadastro, custo_unitario, id_localizacao, created_by, updated_by)
            VALUES
              (${prod1Id}, 'L001', '2025-10-25', 100.00, CURRENT_DATE, ${joaoId}, 4.50, ${b1Id}, ${joaoId}, ${joaoId}),
              (${prod2Id}, 'L002', '2025-11-08', 80.00, CURRENT_DATE, ${joaoId}, 2.10, ${b1Id}, ${joaoId}, ${joaoId}),
              (${prod6Id}, 'L003', '2025-10-20', 5000.00, CURRENT_DATE, ${joaoId}, 0.02, ${b2Id}, ${joaoId}, ${joaoId}),
              (${prod1Id}, 'L004', '2026-02-15', 200.00, CURRENT_DATE, ${joaoId}, 4.55, ${b1Id}, ${joaoId}, ${joaoId}),
              (${prod3Id}, 'L005', '2026-08-20', 300.00, CURRENT_DATE, ${joaoId}, 22.50, ${a1Id}, ${joaoId}, ${joaoId}),
              (${prod3Id}, 'L006', '2026-09-10', 250.00, CURRENT_DATE, ${joaoId}, 22.90, ${a1Id}, ${joaoId}, ${joaoId}),
              (${prod4Id}, 'L007', '2027-01-10', 400.00, CURRENT_DATE, ${joaoId}, 8.50, ${a1Id}, ${joaoId}, ${joaoId}),
              (${prod5Id}, 'L008', '2026-06-01', 150.00, CURRENT_DATE, ${mariaId}, 7.80, ${a2Id}, ${mariaId}, ${mariaId})
            ON CONFLICT (codigo_lote) DO NOTHING;
        `);
    }
}

