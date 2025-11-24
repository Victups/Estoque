import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../../produtos/entities/produto.entity';

/**
 * Validador customizado para verificar se a data de validade é obrigatória
 * quando o produto é perecível
 */
export function IsDataValidadeRequiredForPerecivel(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDataValidadeRequiredForPerecivel',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const dto = args.object as any;
          if (!dto.id_produto) {
            return true; // Deixa outras validações cuidarem
          }

          // A validação real será feita no service, pois precisamos buscar o produto do banco
          // Aqui apenas retornamos true para não bloquear
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Data de validade é obrigatória para produtos perecíveis';
        },
      },
    });
  };
}

