import type { ValidationRule } from '@/types'
import {
  required,
  email,
  minLength,
  maxLength,
  passwordMatch,
  phone,
  cpf,
  cnpj,
  numeric,
  positive,
  url,
} from '@/utils/tramposes/validation'
import { validationRules } from '@/utils/validation'

export const sharedRules = {
  required,
  email,
  minLength,
  maxLength,
  passwordMatch,
  phone,
  cpf,
  cnpj,
  numeric,
  positive,
  url,
  // complementares do validation.ts
  nome: validationRules.nome as ValidationRule,
  alfanumerico: validationRules.alfanumerico as ValidationRule,
  semEspacos: validationRules.semEspacos as ValidationRule,
  codigo: validationRules.codigo as ValidationRule,
  cep: validationRules.cep as ValidationRule,
  uf: validationRules.uf as ValidationRule,
}

export type { ValidationRule }


