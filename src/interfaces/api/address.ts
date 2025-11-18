export interface UfApi {
  id: number
  sigla: string
  nome: string
  ativo?: boolean
}

export interface MunicipioApi {
  id: number
  nome: string
  bairro?: string | null
  idUf?: number
  ativo?: boolean
  uf?: UfApi | null
}

export interface EnderecoApi {
  id: number
  logradouro: string
  numero?: string | null
  complemento?: string | null
  municipio?: MunicipioApi | null
  idMunicipio?: number | null
  ativo?: boolean
}
