import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Dashboard } from './entities/dashboard.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { ProdutoLote } from '../lotes/entities/produto-lote.entity';

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  productsNearExpiration: number;
  lowStockProducts: number;
}

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly repo: Repository<Dashboard>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
    @InjectRepository(ProdutoLote)
    private readonly loteRepo: Repository<ProdutoLote>,
  ) {}
  async create(createDashboardDto: CreateDashboardDto): Promise<Dashboard> {
    const dashboard = this.repo.create(createDashboardDto);
    return this.repo.save(dashboard);
  }

  async findAll(): Promise<Dashboard[]> {
    return this.repo.find({
      relations: ['owner']
    });
  }

  async findOne(id: number): Promise<Dashboard> {
    const dashboard = await this.repo.findOne({ 
      where: { id },
      relations: ['owner']
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  async update(id: number, updateDashboardDto: UpdateDashboardDto): Promise<Dashboard> {
    const dashboard = await this.repo.preload({
      id: id,
      ...updateDashboardDto,
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return this.repo.save(dashboard);
  }

  async remove(id: number): Promise<void> {
    const dashboard = await this.findOne(id);
    await this.repo.remove(dashboard);
  }

  async getStats(): Promise<DashboardStats> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Busca todos os produtos ativos
    const produtos = await this.produtoRepo.find({
      where: { ativo: true },
    });

    // Busca todos os lotes ativos
    const lotes = await this.loteRepo.find({
      where: { ativo: true },
      relations: ['produto'],
    });

    // Calcula estoque total
    const totalStock = lotes.reduce((sum, lote) => {
      return sum + (Number(lote.quantidade) || 0);
    }, 0);

    // Calcula valor total
    const totalValue = lotes.reduce((sum, lote) => {
      const quantidade = Number(lote.quantidade) || 0;
      const custoUnitario = Number(lote.custoUnitario) || 0;
      return sum + (quantidade * custoUnitario);
    }, 0);

    // Conta produtos próximos ao vencimento
    const productsNearExpiration = lotes.filter(lote => {
      if (!lote.dataValidade) {
        return false;
      }
      const expDate = new Date(lote.dataValidade);
      if (Number.isNaN(expDate.getTime())) {
        return false;
      }
      return expDate >= today && expDate <= thirtyDaysFromNow;
    }).length;

    // Conta produtos com estoque baixo
    let lowStockProducts = 0;
    for (const produto of produtos) {
      const productLotes = lotes.filter(l => l.produto?.id === produto.id);
      const totalQty = productLotes.reduce((sum, l) => {
        return sum + (Number(l.quantidade) || 0);
      }, 0);
      const estoqueMinimo = Number(produto.estoqueMinimo) || 0;
      if (totalQty < estoqueMinimo) {
        lowStockProducts++;
      }
    }

    return {
      totalProducts: produtos.length,
      totalStock,
      totalValue: Number(totalValue.toFixed(2)),
      productsNearExpiration,
      lowStockProducts,
    };
  }
}
