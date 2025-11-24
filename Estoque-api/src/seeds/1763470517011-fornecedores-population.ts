import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class FornecedoresPopulation1763470517011 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Buscar IDs dos contatos primeiro para evitar erro de subquery retornando múltiplas linhas
        // Usando DISTINCT ON para garantir apenas um resultado por nome
        const contatos = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.contatos 
            WHERE nome IN ('Distribuidora Alimentos GO', 'Laticínios Centro-Oeste', 'Frios Brasil S.A.')
            ORDER BY nome, id;
        `);

        // Criar mapa de nome para ID
        const contatoMap = new Map<string, number | null>();
        contatos.forEach((contato: any) => {
            contatoMap.set(contato.nome, contato.id);
        });

        // Se não encontrou os contatos, apenas loga um aviso
        // Os contatos devem ser criados pelo seed anterior (1763470517004-contatos-population.ts)
        if (contatos.length === 0) {
            console.warn('Contatos não encontrados. Certifique-se de que o seed de contatos foi executado antes.');
        }

        const distribuidoraContatoId = contatoMap.get('Distribuidora Alimentos GO') || null;
        const lacticiniosContatoId = contatoMap.get('Laticínios Centro-Oeste') || null;
        const friosBrasilContatoId = contatoMap.get('Frios Brasil S.A.') || null;

        // Inserir fornecedores usando os IDs obtidos (usando NULL se não encontrado)
        const distribuidoraId = distribuidoraContatoId ? distribuidoraContatoId : 'NULL';
        const lacticiniosId = lacticiniosContatoId ? lacticiniosContatoId : 'NULL';
        const friosBrasilId = friosBrasilContatoId ? friosBrasilContatoId : 'NULL';

        // Verifica se já existem fornecedores para evitar duplicação
        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.fornecedores 
            WHERE cnpj IN ('01.234.567/0001-89', '98.765.432/0001-10', '11.222.333/0001-44');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        // Se já existem todos os fornecedores, não precisa inserir
        if (existingCount >= 3) {
            console.log('Fornecedores já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.fornecedores (nome, cnpj, id_contato)
            VALUES
              ('Distribuidora de Alimentos Goiás', '01.234.567/0001-89', ${distribuidoraId}),
              ('Laticínios Centro-Oeste', '98.765.432/0001-10', ${lacticiniosId}),
              ('Frios Brasil S.A.', '11.222.333/0001-44', ${friosBrasilId})
            ON CONFLICT (cnpj) DO NOTHING;
        `);
    }
}

