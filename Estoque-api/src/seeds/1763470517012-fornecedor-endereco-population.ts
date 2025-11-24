import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class FornecedorEnderecoPopulation1763470517012 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const fornecedores = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.fornecedores 
            WHERE nome IN ('Distribuidora de Alimentos Goiás', 'Laticínios Centro-Oeste', 'Frios Brasil S.A.')
            ORDER BY nome, id;
        `);

                const enderecos = await dataSource.query(`
            SELECT DISTINCT ON (logradouro) id, logradouro 
            FROM public.enderecos 
            WHERE logradouro IN ('Avenida Comercial', 'Rodovia BR-153', 'Avenida Industrial')
            ORDER BY logradouro, id;
        `);

        const fornecedorMap = new Map<string, number | null>();
        fornecedores.forEach((fornecedor: any) => {
            fornecedorMap.set(fornecedor.nome, fornecedor.id);
        });

        const enderecoMap = new Map<string, number | null>();
        enderecos.forEach((endereco: any) => {
            enderecoMap.set(endereco.logradouro, endereco.id);
        });

        const distribuidoraId = fornecedorMap.get('Distribuidora de Alimentos Goiás') || 'NULL';
        const lacticiniosId = fornecedorMap.get('Laticínios Centro-Oeste') || 'NULL';
        const friosBrasilId = fornecedorMap.get('Frios Brasil S.A.') || 'NULL';

        const avComercialId = enderecoMap.get('Avenida Comercial') || 'NULL';
        const rodoviaId = enderecoMap.get('Rodovia BR-153') || 'NULL';
        const avIndustrialId = enderecoMap.get('Avenida Industrial') || 'NULL';

                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.fornecedor_endereco 
            WHERE id_fornecedor IN (${distribuidoraId}, ${lacticiniosId}, ${friosBrasilId})
            AND id_endereco IN (${avComercialId}, ${rodoviaId}, ${avIndustrialId});
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 3) {
            console.log('Relações fornecedor-endereço já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.fornecedor_endereco (id_fornecedor, id_endereco, tipo_endereco)
            SELECT * FROM (VALUES
              (${distribuidoraId}, ${avComercialId}, 'Comercial'),
              (${lacticiniosId}, ${rodoviaId}, 'Fábrica'),
              (${friosBrasilId}, ${avIndustrialId}, 'Matriz')
            ) AS v(id_fornecedor, id_endereco, tipo_endereco)
            WHERE NOT EXISTS (
                SELECT 1 FROM public.fornecedor_endereco fe 
                WHERE fe.id_fornecedor = v.id_fornecedor 
                AND fe.id_endereco = v.id_endereco
            );
        `);
    }
}

