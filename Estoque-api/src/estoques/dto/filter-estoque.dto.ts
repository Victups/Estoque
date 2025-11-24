import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoMovimentacao } from '../../movimentacoes/entities/movimentacao-estoque.entity';

export class FilterEstoqueDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_produto?: number;

  @IsOptional()
  @IsEnum(TipoMovimentacao)
  tipo_movimento?: TipoMovimentacao;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_usuario?: number;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantidade_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantidade_max?: number;

  @IsOptional()
  @IsString()
  busca?: string; 

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tamanho?: number;
}

