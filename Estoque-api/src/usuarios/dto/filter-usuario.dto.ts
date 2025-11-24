import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum UsuarioRole {
  ADMIN = 'admin',
  GERENTE = 'gerente',
  OPERADOR = 'operador',
  VISUALIZADOR = 'visualizador',
}

export enum UsuarioStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

export class FilterUsuarioDto {
  @IsOptional()
  @IsString()
  busca?: string; // Para busca por nome ou email

  @IsOptional()
  @IsEnum(UsuarioRole)
  role?: UsuarioRole;

  @IsOptional()
  @IsEnum(UsuarioStatus)
  status?: UsuarioStatus;

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

