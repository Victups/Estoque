import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, MaxLength, IsOptional, ValidateIf } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';


export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ValidateIf((o) => o.senha !== undefined && o.senha !== null)
  @IsString()
  @IsNotEmpty({ message: 'Senha não pode estar vazia quando informada' })
  @MaxLength(255, { message: 'Senha deve ter no máximo 255 caracteres' })
  senha?: string;
}
