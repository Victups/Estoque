import { sharedRules } from '../shared'

export const userRules = {
  required: sharedRules.required,
  email: sharedRules.email,
  minLength: sharedRules.minLength,
  passwordMatch: sharedRules.passwordMatch,
  nome: sharedRules.nome,
}
