import type { TipoContato } from '../shared/shared.ts'

export interface ContatoApi {
  id: number
  nome: string
  valor?: string | null
  tipo_contato?: TipoContato
  codigo_pais?: string | null
  dataCriacao?: string
}
