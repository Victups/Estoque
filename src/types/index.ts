// User Types
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  department: Department
  status: UserStatus
  lastAccess: string
  initials: string
  avatarColor: string
}

export interface BackendUser {
  id: number
  nome: string
  email: string
  senha?: string
  id_contato: number
}

export type UserRole = 'Admin' | 'Gerente' | 'Operador' | 'Visualizador'
export type UserStatus = 'Ativo' | 'Inativo'
export type Department = 'TI' | 'Gestão' | 'Estoque' | 'Vendas' | 'Financeiro' | 'Geral'

// Product Types
export interface Product {
  id: number
  nome: string
  codigo: string
  descricao: string
  id_unidade_medida: number
  id_marca: number
  id_categoria: number
  responsavel_cadastro: number
  data_cadastro: string
  usuario_log_id: number | null
  estoque_minimo: number
}

export interface ProductLote {
  id: number
  id_produto: number
  codigo_lote: string
  data_validade: string
  quantidade: number
  data_entrada: string
  responsavel_cadastro: number
  custo_unitario: number
  usuario_log_id: number | null
  id_localizacao: number
}

export interface Category {
  id: number
  nome: string
}

export interface Brand {
  id: number
  nome: string
}

export interface UnitMeasure {
  id: number
  descricao: string
  abreviacao: string
}

// Location Types
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

// Movement Types
export interface StockMovement {
  id: number
  id_produto: number
  quantidade: number
  data_mov: string
  id_usuario: number
  observacao: string | null
  preco_unitario: number
  id_lote: number
  usuario_log_id: number | null
  tipo_movimento: MovementType
  id_localizacao_origem: number | null
  id_localizacao_destino: number | null
}

export type MovementType = 'entrada' | 'saida'

export interface MovementDisplay extends StockMovement {
  produto_nome?: string
  usuario_nome?: string
  lote_codigo?: string
  localizacao_origem_nome?: string
  localizacao_destino_nome?: string
}

export interface CreateMovementData {
  id_produto: number
  quantidade: number
  id_usuario: number
  observacao?: string
  preco_unitario: number
  id_lote: number
  tipo_movimento: MovementType
  id_localizacao_origem?: number | null
  id_localizacao_destino?: number | null
}

// Contact Types
export interface Contact {
  id: number
  nome: string
  valor: string
  tipo_contato: 'email' | 'telefone' | 'whatsapp'
  codigo_pais: string | null
  data_criacao: string
}

// Address Types
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

// Supplier Types
export interface Supplier {
  id: number
  nome: string
  cnpj: string
  id_contato: number
}

// Form Types
export interface ValidationRule {
  (value: string): boolean | string
}

export interface FormRules {
  required: ValidationRule
  email: ValidationRule
  minLength: ValidationRule
  passwordMatch: ValidationRule
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
}

// Snackbar Types
export interface SnackbarState {
  show: boolean
  text: string
  color: 'success' | 'error' | 'warning' | 'info'
}

// Dialog Types
export interface DialogState {
  show: boolean
  title?: string
  message?: string
}

