import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoFornecedor } from './entities/produto-fornecedor.entity';
import { CreateProdutoFornecedorDto } from './dto/create-produto-fornecedor.dto';
import { UpdateProdutoFornecedorDto } from './dto/update-produto-fornecedor.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class ProdutoFornecedorService {
  constructor(
    @InjectRepository(ProdutoFornecedor)
    private readonly repo: Repository<ProdutoFornecedor>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createProdutoFornecedorDto: CreateProdutoFornecedorDto): Promise<ProdutoFornecedor> {
    const produtoFornecedor = this.repo.create({
      idProduto: createProdutoFornecedorDto.id_produto,
      idFornecedor: createProdutoFornecedorDto.id_fornecedor,
      usuarioLogId: createProdutoFornecedorDto.usuario_log_id,
      produto: { id: createProdutoFornecedorDto.id_produto } as any,
      fornecedor: { id: createProdutoFornecedorDto.id_fornecedor } as any,
    });
    const produtoFornecedorSalvo = await this.repo.save(produtoFornecedor);
    
    // Registra auditoria de criação (usando chave composta como identificador único)
    try {
      await this.auditoriaService.registrarInsert(
        'produto_fornecedor',
        produtoFornecedorSalvo.idProduto, // Usa id_produto como registro_id
        produtoFornecedorSalvo,
        createProdutoFornecedorDto.usuario_log_id,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de criação de produto-fornecedor:', error);
    }
    
    return produtoFornecedorSalvo;
  }

  async findAll(): Promise<ProdutoFornecedor[]> {
    return this.repo.find({
      relations: ['produto', 'fornecedor']
    });
  }

  async findOne(idProduto: number, idFornecedor: number): Promise<ProdutoFornecedor> {
    const produtoFornecedor = await this.repo.findOne({
      where: { idProduto, idFornecedor },
      relations: ['produto', 'fornecedor']
    });
    if (!produtoFornecedor) {
      throw new NotFoundException(`Relação produto-fornecedor não encontrada`);
    }
    return produtoFornecedor;
  }

  async update(idProduto: number, idFornecedor: number, updateProdutoFornecedorDto: UpdateProdutoFornecedorDto): Promise<ProdutoFornecedor> {
    const produtoFornecedor = await this.findOne(idProduto, idFornecedor);
    if (updateProdutoFornecedorDto.usuario_log_id) {
      produtoFornecedor.usuarioLogId = updateProdutoFornecedorDto.usuario_log_id;
    }
    return this.repo.save(produtoFornecedor);
  }

  async remove(idProduto: number, idFornecedor: number): Promise<void> {
    const produtoFornecedor = await this.findOne(idProduto, idFornecedor);
    
    // Registra auditoria de exclusão antes de remover
    try {
      await this.auditoriaService.registrarDelete(
        'produto_fornecedor',
        produtoFornecedor.idProduto, // Usa id_produto como registro_id
        produtoFornecedor,
        produtoFornecedor.usuarioLogId,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de exclusão de produto-fornecedor:', error);
    }
    
    await this.repo.remove(produtoFornecedor);
  }
}