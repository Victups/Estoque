import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';
import { ProdutoLote } from '../lotes/entities/produto-lote.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { FilterProdutoDto, ProdutoStatus } from './dto/filter-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly repo: Repository<Produto>,
    @InjectRepository(ProdutoLote)
    private readonly loteRepo: Repository<ProdutoLote>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const codigoInformado = createProdutoDto.codigo?.trim();
    let codigo = codigoInformado;
    let id: number | undefined;

    if (!codigoInformado) {
      const result = await this.repo.query(
        "SELECT nextval('public.produto_id_produto_seq') AS id",
      );
      id = Number(result?.[0]?.id ?? result?.[0]?.nextval);
      codigo = `PROD${String(id).padStart(3, '0')}`;
    }

    const produto = this.repo.create({
      id,
      nome: createProdutoDto.nome,
      codigo,
      descricao: createProdutoDto.descricao,
      unidadeMedida: { id: createProdutoDto.id_unidade_medida } as any,
      marca: createProdutoDto.id_marca ? ({ id: createProdutoDto.id_marca } as any) : undefined,
      categoria: createProdutoDto.id_categoria
        ? ({ id: createProdutoDto.id_categoria } as any)
        : undefined,
      responsavelCadastro: { id: createProdutoDto.responsavel_cadastro } as any,
      usuarioLog: createProdutoDto.usuario_log_id
        ? ({ id: createProdutoDto.usuario_log_id } as any)
        : undefined,
      usuarioLogId: createProdutoDto.usuario_log_id ?? undefined,
      ativo: createProdutoDto.ativo ?? true,
      isPerecivel: createProdutoDto.is_perecivel ?? false,
      createdBy: { id: createProdutoDto.responsavel_cadastro } as any,
      updatedBy: { id: createProdutoDto.responsavel_cadastro } as any,
    });
    const produtoSalvo = await this.repo.save(produto);
    
    // Registra auditoria de criação
    try {
      await this.auditoriaService.registrarInsert(
        'produtos',
        produtoSalvo.id,
        produtoSalvo,
        createProdutoDto.usuario_log_id || createProdutoDto.responsavel_cadastro,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de criação de produto:', error);
      // Não interrompe o fluxo se a auditoria falhar
    }
    
    return produtoSalvo;
  }

  async findAll(filterDto?: FilterProdutoDto): Promise<Produto[] | { items: Produto[]; total: number; pagina: number; totalPaginas: number }> {
    try {
      const where: any = {};
      
      // Filtro por nome/código
      if (filterDto?.filtro) {
        where.nome = Like(`%${filterDto.filtro}%`);
      }

      // Filtro por status
      if (filterDto?.status && filterDto.status !== ProdutoStatus.TODOS) {
        where.ativo = filterDto.status === ProdutoStatus.ATIVO;
      }

      // Filtro por categoria
      if (filterDto?.id_categoria) {
        where.categoria = { id: filterDto.id_categoria };
      }

      // Filtro por marca
      if (filterDto?.id_marca) {
        where.marca = { id: filterDto.id_marca };
      }

      // Se houver paginação ou filtros, retorna resposta paginada
      if (filterDto?.pagina || filterDto?.tamanho || filterDto?.filtro || filterDto?.status) {
        const pagina = filterDto.pagina || 1;
        const tamanho = filterDto.tamanho || 20;
        const skip = (pagina - 1) * tamanho;

        const [items, total] = await this.repo.findAndCount({
          where,
          relations: [
            'unidadeMedida',
            'marca',
            'categoria',
            'responsavelCadastro',
            'usuarioLog',
          ],
          skip,
          take: tamanho,
          order: { id: 'ASC' },
        });

        // Aplicar filtro de preço em memória (se necessário, pode ser movido para query)
        let produtosFiltrados = items;
        if (filterDto.preco_min !== undefined || filterDto.preco_max !== undefined) {
          produtosFiltrados = items.filter(produto => {
            // TODO: Implementar cálculo de preço do produto quando houver campo de preço
            // Por enquanto retorna todos
            return true;
          });
        }

        const totalPaginas = Math.ceil(total / tamanho);

        return {
          items: produtosFiltrados,
          total,
          pagina,
          totalPaginas,
        };
      }

      // Retorno simples sem paginação (compatibilidade com código existente)
      return await this.repo.find({
        where,
        relations: [
          'unidadeMedida',
          'marca',
          'categoria',
          'responsavelCadastro',
          'usuarioLog',
        ],
        order: { id: 'ASC' },
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<Produto> {
    const produto = await this.repo.findOne({
      where: { id },
      relations: [
        'unidadeMedida',
        'marca',
        'categoria',
        'responsavelCadastro',
        'usuarioLog',
        'lotes',
        'lotes.localizacao',
        'fornecedores',
        'fornecedores.fornecedor',
        'movimentacoes',
      ],
    });
    
    if (!produto) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }
    
    return produto;
  }

  async getEstoqueByProdutoId(id: number): Promise<{ estoqueTotal: number; lotes: any[] }> {
    const produto = await this.findOne(id);
    
    const lotes = await this.loteRepo.find({
      where: {
        produto: { id },
        ativo: true,
      },
      relations: ['localizacao'],
    });
    
    const estoqueTotal = lotes.reduce((sum, lote) => {
      return sum + (Number(lote.quantidade) || 0);
    }, 0);
    
    return {
      estoqueTotal,
      lotes: lotes.map(lote => ({
        id: lote.id,
        codigo_lote: lote.codigoLote,
        quantidade: Number(lote.quantidade) || 0,
        custo_unitario: lote.custoUnitario ? Number(lote.custoUnitario) : null,
        data_validade: lote.dataValidade,
        localizacao: lote.localizacao,
      })),
    };
  }

  async getEstoqueBaixo(): Promise<Produto[]> {
    const produtos = await this.repo.find({
      where: { ativo: true },
      relations: ['lotes', 'unidadeMedida', 'marca', 'categoria'],
    });
    
    const lotes = await this.loteRepo.find({
      where: { ativo: true },
      relations: ['produto'],
    });
    
    const produtosComEstoqueBaixo = produtos.filter(produto => {
      const productLotes = lotes.filter(l => l.produto?.id === produto.id);
      const totalQty = productLotes.reduce((sum, l) => {
        return sum + (Number(l.quantidade) || 0);
      }, 0);
      const estoqueMinimo = Number(produto.estoqueMinimo) || 0;
      return totalQty < estoqueMinimo;
    });
    
    return produtosComEstoqueBaixo;
  }

  async update(id: number, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    // Busca o produto antes da atualização para auditoria
    const produtoAntes = await this.repo.findOne({
      where: { id },
      relations: [
        'unidadeMedida',
        'marca',
        'categoria',
        'responsavelCadastro',
      ],
    });

    if (!produtoAntes) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }

    const produto = await this.repo.preload({
      id,
      ...updateProdutoDto,
      ...(updateProdutoDto.id_unidade_medida && {
        unidadeMedida: { id: updateProdutoDto.id_unidade_medida } as any,
      }),
      ...(updateProdutoDto.id_marca && {
        marca: { id: updateProdutoDto.id_marca } as any,
      }),
      ...(updateProdutoDto.id_categoria && {
        categoria: { id: updateProdutoDto.id_categoria } as any,
      }),
      ...(updateProdutoDto.responsavel_cadastro && {
        responsavelCadastro: { id: updateProdutoDto.responsavel_cadastro } as any,
      }),
      ...(updateProdutoDto.usuario_log_id && {
        usuarioLog: { id: updateProdutoDto.usuario_log_id } as any,
        usuarioLogId: updateProdutoDto.usuario_log_id,
        updatedBy: { id: updateProdutoDto.usuario_log_id } as any,
      }),
    });

    if (!produto) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }

    const produtoAtualizado = await this.repo.save(produto);
    
    // Registra auditoria de atualização
    try {
      await this.auditoriaService.registrarUpdate(
        'produtos',
        produtoAtualizado.id,
        produtoAntes,
        produtoAtualizado,
        updateProdutoDto.usuario_log_id || updateProdutoDto.responsavel_cadastro,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de atualização de produto:', error);
      // Não interrompe o fluxo se a auditoria falhar
    }
    
    return produtoAtualizado;
  }

  async remove(id: number): Promise<void> {
    const produto = await this.findOne(id);
    
    // Registra auditoria de exclusão antes de remover
    try {
      await this.auditoriaService.registrarDelete(
        'produtos',
        produto.id,
        produto,
        produto.usuarioLogId || produto.responsavelCadastro?.id,
      );
    } catch (error) {
      console.error('Erro ao registrar auditoria de exclusão de produto:', error);
      // Não interrompe o fluxo se a auditoria falhar
    }
    
    await this.repo.remove(produto);
  }
}
