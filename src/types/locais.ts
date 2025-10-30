// Localizações e depósitos

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

// Endereço e UF/Município
export interface Address {
  id: number
  logradouro: string
  numero: string
  complemento: string | null
  cep: string
  id_municipio: number
}

export interface Municipality {
  id: number
  nome: string
  id_uf: number
  bairro: string
}

export interface State {
  id: number
  sigla: string
  nome: string
}


