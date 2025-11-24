import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDatabaseEnum1762525392213 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE public.movimento_tipo_enum AS ENUM ('entrada', 'saida');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE public.role_enum AS ENUM ('admin', 'gestor', 'estoquista', 'relatorios');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE public.tipo_contato_enum AS ENUM ('telefone', 'email', 'whatsapp', 'instagram', 'telegram', 'outro');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE public.unidade_enum AS ENUM ('un', 'kg', 'L', 'pac', 'cx', 'g', 'ml');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      $$;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS public.unidade_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS public.tipo_contato_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS public.role_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS public.movimento_tipo_enum`);
    }
}
