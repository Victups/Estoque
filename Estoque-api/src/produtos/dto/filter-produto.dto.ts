import { IsOptional, IsString, IsNumber, Min, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProdutoStatus {
  TODOS = 'todos',
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

export class FilterProdutoDto {
  @IsString()
  @IsOptional()
  filtro?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  pagina?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  tamanho?: number;

  @IsEnum(ProdutoStatus)
  @IsOptional()
  status?: ProdutoStatus;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  preco_min?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  preco_max?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  id_categoria?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  id_marca?: number;
}

