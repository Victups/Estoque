// Contatos e validação (compartilhados)

export type TipoContato = 'telefone' | 'email' | 'whatsapp' | 'instagram' | 'telegram' | 'outro'

export interface Contact {
  id: number
  nome: string
  valor: string
  tipo_contato: TipoContato
  codigo_pais: string | null
  data_criacao: string
}

export interface ValidationRule {
  (value: string): boolean | string
}


