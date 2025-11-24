import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoFornecedorController } from './produto-fornecedor.controller';
import { ProdutoFornecedorService } from './produto-fornecedor.service';
import { ProdutoFornecedor } from './entities/produto-fornecedor.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProdutoFornecedor]),
    AuditoriaModule,
  ],
  controllers: [ProdutoFornecedorController],
  providers: [ProdutoFornecedorService]
})
export class ProdutoFornecedorModule {}
