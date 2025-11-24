import type { ValidationRule } from '@/interfaces'

/**
 * Utilitários de validação de formulários
 */

export const required: ValidationRule = (v: string): boolean | string => {
  return !!v || 'Campo obrigatório'
}

export const email: ValidationRule = (v: string): boolean | string => {
  return /.+@.+\..+/.test(v) || 'Email inválido'
}

export function minLength (min: number): ValidationRule {
  return (v: string): boolean | string => {
    return (v && v.length >= min) || `Mínimo de ${min} caracteres`
  }
}

export function maxLength (max: number): ValidationRule {
  return (v: string): boolean | string => {
    return (v && v.length <= max) || `Máximo de ${max} caracteres`
  }
}

export function passwordMatch (password: { value: string }): ValidationRule {
  return (v: string): boolean | string => {
    return v === password.value || 'As senhas não coincidem'
  }
}

export const phone: ValidationRule = (v: string): boolean | string => {
  const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/
  return phoneRegex.test(v) || 'Telefone inválido'
}

export const cpf: ValidationRule = (v: string): boolean | string => {
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/
  return cpfRegex.test(v) || 'CPF inválido'
}

export const cnpj: ValidationRule = (v: string): boolean | string => {
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/
  return cnpjRegex.test(v) || 'CNPJ inválido'
}

export const numeric: ValidationRule = (v: string): boolean | string => {
  return !Number.isNaN(Number(v)) || 'Apenas números são permitidos'
}

export const positive: ValidationRule = (v: string): boolean | string => {
  return Number(v) > 0 || 'Valor deve ser positivo'
}

export const url: ValidationRule = (v: string): boolean | string => {
  try {
    new URL(v)
    return true
  } catch {
    return 'URL inválida'
  }
}
