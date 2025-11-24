export interface Location {
  id: number
  id_deposito: number
  corredor: string
  prateleira: string
  secao: string
}

export interface Deposit {
  id: number
  nome: string
  id_endereco: number
}

export interface Address {
  id: number
  logradouro: string
  numero: string
  complemento: string | null
  bairro?: string
  id_municipio: number
}

export interface Municipality {
  id: number
  nome: string
  id_uf: number
  // REMOVIDO: bairro
}

export interface State {
  id: number
  sigla: string
  nome: string
}

