import type { EnderecoApi } from './address.ts'

export interface DepositoApi {
  id: number
  nome: string
  endereco?: EnderecoApi | null
}

export interface LocalizacaoApi {
  id: number
  corredor?: string | null
  prateleira?: string | null
  secao?: string | null
  deposito?: DepositoApi | null
}
