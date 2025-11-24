import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const senhaHash = await this.hashSenha(createUsuarioDto.senha);
    const usuario = this.repo.create({
      ...createUsuarioDto,
      email: createUsuarioDto.email.toLowerCase(),
      senha: senhaHash,
      contato: createUsuarioDto.id_contato ? ({ id: createUsuarioDto.id_contato } as any) : undefined,
    });
    const usuarioSalvo = await this.repo.save(usuario);
    
    try {
      await this.auditoriaService.registrarInsert(
        'usuarios',
        usuarioSalvo.id,
        usuarioSalvo,
        undefined,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de criação de usuário:', error);
    }
    
    return usuarioSalvo;
  }

  async findAll(): Promise<Usuario[]> {
    return this.repo.find({
      relations: ['contato'],
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.repo.findOne({
      where: { id },
      relations: ['contato'],
    });
    
    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuarioAntes = await this.repo.findOne({
      where: { id },
      relations: ['contato'],
    });

    if (!usuarioAntes) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    const payload: Partial<Usuario> = {
      id,
      ...updateUsuarioDto,
      ...(updateUsuarioDto.id_contato && {
        contato: { id: updateUsuarioDto.id_contato } as any,
      }),
    };

    if (updateUsuarioDto.senha) {
      payload.senha = await this.hashSenha(updateUsuarioDto.senha);
    }

    if (updateUsuarioDto.email) {
      payload.email = updateUsuarioDto.email.toLowerCase();
    }

    const usuario = await this.repo.preload({
      ...payload,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    const usuarioAtualizado = await this.repo.save(usuario);
    
    try {
      await this.auditoriaService.registrarUpdate(
        'usuarios',
        usuarioAtualizado.id,
        usuarioAntes,
        usuarioAtualizado,
        undefined,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de atualização de usuário:', error);
    }
    
    return usuarioAtualizado;
  }

  private async hashSenha(senha: string): Promise<string> {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    return bcrypt.hash(senha, saltRounds);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    
    try {
      await this.auditoriaService.registrarDelete(
        'usuarios',
        usuario.id,
        usuario,
        undefined,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de exclusão de usuário:', error);
    }
    
    await this.repo.remove(usuario);
  }

  /**
   * Retorna estatísticas dos usuários do sistema
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeUsersCount: number;
    inactiveUsersCount: number;
    adminCount: number;
  }> {
    const usuarios = await this.repo.find();
    
    const activeUsers = usuarios.filter(u => u.ativo !== false);
    const inactiveUsers = usuarios.filter(u => u.ativo === false);
    const adminUsers = usuarios.filter(u => u.role === 'admin');
    
    return {
      totalUsers: usuarios.length,
      activeUsersCount: activeUsers.length,
      inactiveUsersCount: inactiveUsers.length,
      adminCount: adminUsers.length,
    };
  }

}