import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum OperacaoAuditoria {
  INSERT = 'I',
  UPDATE = 'U',
  DELETE = 'D',
}

@Entity('auditoria_alteracoes')
export class AuditoriaAlteracao {
  @PrimaryGeneratedColumn({ name: 'audit_id' })
  auditId: number;

  @Column({ length: 100 })
  tabela: string;

  @Column({ name: 'registro_id' })
  registroId: number;

  @Column({ type: 'char', length: 1 })
  operacao: OperacaoAuditoria;

  @Column({ name: 'dados_antes', type: 'jsonb', nullable: true })
  dadosAntes?: any;

  @Column({ name: 'dados_depois', type: 'jsonb', nullable: true })
  dadosDepois?: any;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: number;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column({ name: 'audit_timestamp', type: 'timestamptz', default: () => 'now()' })
  auditTimestamp: Date;
}

