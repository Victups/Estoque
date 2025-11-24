import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class ProdutosPopulation1763470517013 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
                const unidades = await dataSource.query(`
            SELECT DISTINCT ON (descricao) id, descricao 
            FROM public.unidade_medidas 
            WHERE descricao IN ('Litro', 'Unidade', 'Quilograma', 'Pacote', 'Grama')
            ORDER BY descricao, id;
        `);

        const marcas = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.marcas 
            WHERE nome IN ('Piracanjuba', 'Italac', 'Tio João', 'Camil', 'Coca-Cola', 'Sadia')
            ORDER BY nome, id;
        `);

        const categorias = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.categorias 
            WHERE nome IN ('Laticínios', 'Grãos e Cereais', 'Bebidas', 'Frios e Embutidos')
            ORDER BY nome, id;
        `);

        const usuarios = await dataSource.query(`
            SELECT DISTINCT ON (email) id, email 
            FROM public.usuarios 
            WHERE email IN ('admin@sistema.com', 'maria.souza@empresa.com')
            ORDER BY email, id;
        `);

        // Criar mapas
        const unidadeMap = new Map<string, number | null>();
        unidades.forEach((u: any) => unidadeMap.set(u.descricao, u.id));

        const marcaMap = new Map<string, number | null>();
        marcas.forEach((m: any) => marcaMap.set(m.nome, m.id));

        const categoriaMap = new Map<string, number | null>();
        categorias.forEach((c: any) => categoriaMap.set(c.nome, c.id));

        const usuarioMap = new Map<string, number | null>();
        usuarios.forEach((u: any) => usuarioMap.set(u.email, u.id));

        // Obter IDs específicos
        const litroId = unidadeMap.get('Litro') || 'NULL';
        const unidadeId = unidadeMap.get('Unidade') || 'NULL';
        const quilogramaId = unidadeMap.get('Quilograma') || 'NULL';
        const pacoteId = unidadeMap.get('Pacote') || 'NULL';
        const gramaId = unidadeMap.get('Grama') || 'NULL';

        const piracanjubaId = marcaMap.get('Piracanjuba') || 'NULL';
        const italacId = marcaMap.get('Italac') || 'NULL';
        const tioJoaoId = marcaMap.get('Tio João') || 'NULL';
        const camilId = marcaMap.get('Camil') || 'NULL';
        const cocaColaId = marcaMap.get('Coca-Cola') || 'NULL';
        const sadiaId = marcaMap.get('Sadia') || 'NULL';

        const lacticiniosId = categoriaMap.get('Laticínios') || 'NULL';
        const graosCereaisId = categoriaMap.get('Grãos e Cereais') || 'NULL';
        const bebidasId = categoriaMap.get('Bebidas') || 'NULL';
        const friosEmbutidosId = categoriaMap.get('Frios e Embutidos') || 'NULL';

        const adminId = usuarioMap.get('admin@sistema.com') || 'NULL';
        const mariaId = usuarioMap.get('maria.souza@empresa.com') || 'NULL';

                const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.produtos 
            WHERE codigo IN ('PROD001', 'PROD002', 'PROD003', 'PROD004', 'PROD005', 'PROD006');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
                if (existingCount >= 6) {
            console.log('Produtos já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.produtos (nome, codigo, descricao, id_unidade_medida, id_marca, id_categoria, responsavel_cadastro, estoque_minimo, is_perecivel)
            VALUES
              ('Leite Integral UHT', 'PROD001', 'Leite de vaca integral longa vida', ${litroId}, ${piracanjubaId}, ${lacticiniosId}, ${adminId}, 50.00, false),
              ('Iogurte Natural', 'PROD002', 'Iogurte natural sem açúcar', ${unidadeId}, ${italacId}, ${lacticiniosId}, ${adminId}, 30.00, false),
              ('Arroz Agulhinha Tipo 1', 'PROD003', 'Arroz branco longo fino', ${quilogramaId}, ${tioJoaoId}, ${graosCereaisId}, ${mariaId}, 100.00, false),
              ('Feijão Carioca', 'PROD004', 'Feijão carioca tipo 1', ${pacoteId}, ${camilId}, ${graosCereaisId}, ${mariaId}, 80.00, false),
              ('Refrigerante de Cola', 'PROD005', 'Refrigerante sabor cola 2L', ${litroId}, ${cocaColaId}, ${bebidasId}, ${mariaId}, 40.00, false),
              ('Presunto Cozido Fatiado', 'PROD006', 'Presunto cozido sem capa de gordura', ${gramaId}, ${sadiaId}, ${friosEmbutidosId}, ${mariaId}, 2000.00, false)
            ON CONFLICT (codigo) DO NOTHING;
        `);
    }
}

