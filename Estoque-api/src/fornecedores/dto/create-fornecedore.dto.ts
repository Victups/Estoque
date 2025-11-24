import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateFornecedoreDto {

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly id?: number;

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    readonly id_contato?: number;
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    readonly nome: string;
    
    @IsBoolean()
    @IsOptional()
    readonly ativo?: boolean;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, { message: 'CNPJ inválido' })
    readonly cnpj?: string;
    
}
