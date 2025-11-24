import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstoquesController } from './estoques.controller';
import { EstoquesService } from './estoques.service';
import { RegistroMovimentacao } from './entities/registro-movimentacao.entity';
import { MovimentacaoEstoque } from '../movimentacoes/entities/movimentacao-estoque.entity';
import { ProdutoLote } from '../lotes/entities/produto-lote.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroMovimentacao, MovimentacaoEstoque, ProdutoLote]),
    AuditoriaModule,
  ],
  controllers: [EstoquesController],
  providers: [EstoquesService],
})
export class EstoquesModule {}
