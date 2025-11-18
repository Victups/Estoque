import type { ValidationRule } from '@/interfaces'

/**
 * Utilitário com regras de validação reutilizáveis
 */
export const validationRules = {
  required: (v: string): boolean | string => {
    return !!v || 'Campo obrigatório'
  },

  email: (v: string): boolean | string => {
    return /.+@.+\..+/.test(v) || 'Email inválido'
  },

  minLength: (min: number): ValidationRule => {
    return (v: string): boolean | string => {
      return (v && v.length >= min) || `Mínimo de ${min} caracteres`
    }
  },

  maxLength: (max: number): ValidationRule => {
    return (v: string): boolean | string => {
      return (v && v.length <= max) || `Máximo de ${max} caracteres`
    }
  },

  passwordMatch: (password: { value: string }): ValidationRule => {
    return (v: string): boolean | string => {
      return v === password.value || 'As senhas não coincidem'
    }
  },

  phone: (v: string): boolean | string => {
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/
    return phoneRegex.test(v) || 'Telefone inválido'
  },

  cpf: (v: string): boolean | string => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/
    return cpfRegex.test(v) || 'CPF inválido'
  },

  cnpj: (v: string): boolean | string => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/
    return cnpjRegex.test(v) || 'CNPJ inválido'
  },

  numeric: (v: string): boolean | string => {
    return !Number.isNaN(Number(v)) || 'Apenas números são permitidos'
  },

  positive: (v: string): boolean | string => {
    return Number(v) > 0 || 'Valor deve ser positivo'
  },

  url: (v: string): boolean | string => {
    try {
      new URL(v)
      return true
    } catch {
      return 'URL inválida'
    }
  },

  uf: (v: string): boolean | string => {
    const ufRegex = /^[A-Z]{2}$/
    return ufRegex.test(v) || 'UF deve ter exatamente 2 letras maiúsculas'
  },

  nome: (v: string): boolean | string => {
    const nomeRegex = /^[a-zA-ZÀ-ÿ\s]+$/
    return nomeRegex.test(v) || 'Nome deve conter apenas letras e espaços'
  },

  alfanumerico: (v: string): boolean | string => {
    const alfanumericoRegex = /^[a-zA-Z0-9\s]+$/
    return alfanumericoRegex.test(v) || 'Apenas letras, números e espaços são permitidos'
  },

  semEspacos: (v: string): boolean | string => {
    return !v.includes(' ') || 'Não são permitidos espaços'
  },

  codigo: (v: string): boolean | string => {
    const codigoRegex = /^[A-Z0-9]+$/
    return codigoRegex.test(v) || 'Código deve conter apenas letras maiúsculas e números'
  },
}

/**
 * Mixin para validação de formulários
 */
export const validationMixin = {
  data () {
    return {
      validation: validationRules,
    }
  },
}
