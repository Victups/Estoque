import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { Dashboard } from './entities/dashboard.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { ProdutoLote } from '../lotes/entities/produto-lote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dashboard, Produto, ProdutoLote])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
