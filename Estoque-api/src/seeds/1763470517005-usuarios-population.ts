import { DataSource } from 'typeorm';
import type { SeederFactoryManager } from 'typeorm-extension';
import { Seeder } from './seeder.interface';

export class UsuariosPopulation1763470517005 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const contatos = await dataSource.query(`
            SELECT DISTINCT ON (nome) id, nome 
            FROM public.contatos 
            WHERE nome IN ('Admin Sys', 'João Almoxarife', 'Maria Gerente')
            ORDER BY nome, id;
        `);

        const contatoMap = new Map<string, number | null>();
        contatos.forEach((contato: any) => {
            contatoMap.set(contato.nome, contato.id);
        });

        if (contatos.length === 0) {
            console.warn('Contatos não encontrados. Tentando criar contatos primeiro...');
            await dataSource.query(`
                INSERT INTO public.contatos (nome, valor, tipo_contato, codigo_pais)
                VALUES
                  ('Admin Sys', 'admin@sistema.com', 'email'::tipo_contato_enum, NULL),
                  ('João Almoxarife', '62988776655', 'whatsapp'::tipo_contato_enum, '55'),
                  ('Maria Gerente', 'maria.gerente@empresa.com', 'email'::tipo_contato_enum, NULL)
                ON CONFLICT DO NOTHING;
            `);
            
            const novosContatos = await dataSource.query(`
                SELECT DISTINCT ON (nome) id, nome 
                FROM public.contatos 
                WHERE nome IN ('Admin Sys', 'João Almoxarife', 'Maria Gerente')
                ORDER BY nome, id;
            `);
            novosContatos.forEach((contato: any) => {
                contatoMap.set(contato.nome, contato.id);
            });
        }

        const adminContatoId = contatoMap.get('Admin Sys') || null;
        const joaoContatoId = contatoMap.get('João Almoxarife') || null;
        const mariaContatoId = contatoMap.get('Maria Gerente') || null;

        const adminId = adminContatoId ? adminContatoId : 'NULL';
        const joaoId = joaoContatoId ? joaoContatoId : 'NULL';
        const mariaId = mariaContatoId ? mariaContatoId : 'NULL';

        const countResult = await dataSource.query(`
            SELECT COUNT(*) as count FROM public.usuarios 
            WHERE email IN ('admin@sistema.com', 'joao.silva@empresa.com', 'maria.souza@empresa.com');
        `);
        
        const existingCount = parseInt(countResult[0]?.count || '0', 10);
        
        if (existingCount >= 3) {
            console.log('Usuários já existem, pulando seed...');
            return;
        }

        await dataSource.query(`
            INSERT INTO public.usuarios (nome, email, senha, id_contato, role)
            VALUES
              ('Administrador', 'admin@sistema.com', '$2b$10$15qJFrKQkUg37znqbfmIye6oPW22mleONHQhRu0ei1cwNIr/9Zidu', ${adminId}, 'admin'),
              ('João da Silva', 'joao.silva@empresa.com', '$2b$10$wIwToKUbziTBnWL4j6P./Of2UwARmjeecweINlv98NHra1rOzMpxa', ${joaoId}, 'estoquista'),
              ('Maria Souza', 'maria.souza@empresa.com', '$2b$10$i8TXBNYm91PsMb80iGcIKeTb8VvkJHTb19FC.vAHE4xp4LjVqM6bO', ${mariaId}, 'gestor')
            ON CONFLICT (email) DO NOTHING;
        `);
    }
}

