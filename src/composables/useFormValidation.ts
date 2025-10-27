import type { ValidationRule } from '@/types'

/**
 * Composable com regras de validação reutilizáveis
 */
export function useFormValidation () {
  const required: ValidationRule = (v: string): boolean | string => {
    return !!v || 'Campo obrigatório'
  }

  const email: ValidationRule = (v: string): boolean | string => {
    return /.+@.+\..+/.test(v) || 'Email inválido'
  }

  const minLength = (min: number): ValidationRule => {
    return (v: string): boolean | string => {
      return (v && v.length >= min) || `Mínimo de ${min} caracteres`
    }
  }

  const maxLength = (max: number): ValidationRule => {
    return (v: string): boolean | string => {
      return (v && v.length <= max) || `Máximo de ${max} caracteres`
    }
  }

  const passwordMatch = (password: { value: string }): ValidationRule => {
    return (v: string): boolean | string => {
      return v === password.value || 'As senhas não coincidem'
    }
  }

  const phone: ValidationRule = (v: string): boolean | string => {
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/
    return phoneRegex.test(v) || 'Telefone inválido'
  }

  const cpf: ValidationRule = (v: string): boolean | string => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/
    return cpfRegex.test(v) || 'CPF inválido'
  }

  const cnpj: ValidationRule = (v: string): boolean | string => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/
    return cnpjRegex.test(v) || 'CNPJ inválido'
  }

  const numeric: ValidationRule = (v: string): boolean | string => {
    return !isNaN(Number(v)) || 'Apenas números são permitidos'
  }

  const positive: ValidationRule = (v: string): boolean | string => {
    return Number(v) > 0 || 'Valor deve ser positivo'
  }

  const url: ValidationRule = (v: string): boolean | string => {
    try {
      new URL(v)
      return true
    } catch {
      return 'URL inválida'
    }
  }

  return {
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
  }
}
