import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class ProdutoFornecedorPopulation1763470517014 implements Seeder {
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

        const fornecedores = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.fornecedores 
            WHERE nome IN ('Laticínios Centro-Oeste', 'Distribuidora de Alimentos Goiás', 'Frios Brasil S.A.')
            ORDER BY nome, id;
        `);

        const usuarios = await dataSource.query(`
            SELECT DISTINCT ON (email) id, email 
            FROM public.usuarios 
            WHERE email = 'admin@sistema.com'
            ORDER BY email, id
            LIMIT 1;
        `);

        const produtoMap = new Map<string, number | null>();
        produtos.forEach((produto: any) => {
            produtoMap.set(produto.codigo, produto.id);
        });

        const fornecedorMap = new Map<string, number | null>();
        fornecedores.forEach((fornecedor: any) => {
            fornecedorMap.set(fornecedor.nome, fornecedor.id);
        });

        const adminId = usuarios.length > 0 ? usuarios[0].id : 'NULL';

        const prod1Id = produtoMap.get('PROD001') || 'NULL';
        const prod2Id = produtoMap.get('PROD002') || 'NULL';
        const prod3Id = produtoMap.get('PROD003') || 'NULL';
        const prod4Id = produtoMap.get('PROD004') || 'NULL';
        const prod5Id = produtoMap.get('PROD005') || 'NULL';
        const prod6Id = produtoMap.get('PROD006') || 'NULL';

        const lacticiniosId = fornecedorMap.get('Laticínios Centro-Oeste') || 'NULL';
        const distribuidoraId = fornecedorMap.get('Distribuidora de Alimentos Goiás') || 'NULL';
        const friosBrasilId = fornecedorMap.get('Frios Brasil S.A.') || 'NULL';

        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.produto_fornecedor 
            WHERE (id_produto, id_fornecedor) IN (
                (${prod1Id}, ${lacticiniosId}),
                (${prod2Id}, ${lacticiniosId}),
                (${prod3Id}, ${distribuidoraId}),
                (${prod4Id}, ${distribuidoraId}),
                (${prod5Id}, ${distribuidoraId}),
                (${prod6Id}, ${friosBrasilId})
            );
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        if (existingCount >= 6) {
            console.log('Relações produto-fornecedor já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.produto_fornecedor (id_produto, id_fornecedor, data_cadastro, usuario_log_id)
            SELECT * FROM (VALUES
              (${prod1Id}, ${lacticiniosId}, CURRENT_TIMESTAMP, ${adminId}),
              (${prod2Id}, ${lacticiniosId}, CURRENT_TIMESTAMP, ${adminId}),
              (${prod3Id}, ${distribuidoraId}, CURRENT_TIMESTAMP, ${adminId}),
              (${prod4Id}, ${distribuidoraId}, CURRENT_TIMESTAMP, ${adminId}),
              (${prod5Id}, ${distribuidoraId}, CURRENT_TIMESTAMP, ${adminId}),
              (${prod6Id}, ${friosBrasilId}, CURRENT_TIMESTAMP, ${adminId})
            ) AS v(id_produto, id_fornecedor, data_cadastro, usuario_log_id)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.produto_fornecedor pf 
                WHERE pf.id_produto = v.id_produto 
                AND pf.id_fornecedor = v.id_fornecedor
            );
        `);
    }
}

