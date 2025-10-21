// User Types (db.json: usuarios)
export type RoleBackend = 'admin' | 'gestor' | 'estoquista' | 'relatorios'

export interface BackendUser {
  id: number
  nome: string
  email: string
  senha?: string
  id_contato: number
  role: RoleBackend
}

// UI Helper Types (não existem no banco)
export type UserRole = 'Admin' | 'Gerente' | 'Operador' | 'Visualizador'

export interface User {
  id: number
  nome: string
  name?: string // alias para compatibilidade
  email: string
  role: UserRole
  department: string
  avatar?: string
  status?: 'active' | 'inactive'
  avatarColor?: string
  initials?: string
  lastAccess?: string
}

export interface Department {
  id: number
  nome: string
  descricao?: string
}

// Product Types (db.json: produtos)
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

// Product Lote (db.json: produto_lotes)
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

// Category (db.json: categorias)
export interface Category {
  id: number
  nome: string
}

// Brand (db.json: marcas)
export interface Brand {
  id: number
  nome: string
}

// Unit Measure (db.json: unidade_medidas)
export type UnidadeAbreviacao = 'un' | 'kg' | 'L' | 'pac' | 'cx' | 'g' | 'ml'

export interface UnitMeasure {
  id: number
  descricao: string
  abreviacao: UnidadeAbreviacao
}

// Location (db.json: localizacoes)
export interface Location {
  id: number
  id_deposito: number
  corredor: string
  prateleira: string
  secao: string
}

// Deposit (db.json: depositos)
export interface Deposit {
  id: number
  nome: string
  id_endereco: number
}

// Movement (db.json: movimentacao_estoque)
export type MovementType = 'entrada' | 'saida'

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

// UI Helper Type
export interface MovementDisplay extends StockMovement {
  produto_nome?: string
  produto_codigo?: string
  usuario_nome?: string
  lote_codigo?: string
  localizacao_origem_nome?: string
  localizacao_destino_nome?: string
}

// Contact (db.json: contatos)
export type TipoContato = 'telefone' | 'email' | 'whatsapp' | 'instagram' | 'telegram' | 'outro'

export interface Contact {
  id: number
  nome: string
  valor: string
  tipo_contato: TipoContato
  codigo_pais: string | null
  data_criacao: string
}

// Address (db.json: enderecos)
export interface Address {
  id: number
  logradouro: string
  numero: string
  complemento: string | null
  cep: string
  id_municipio: number
}

// Municipality (db.json: municipio)
export interface Municipality {
  id: number
  nome: string
  id_uf: number
  bairro: string
}

// State (db.json: uf)
export interface State {
  id: number
  sigla: string
  nome: string
}

// Supplier (db.json: fornecedores)
export interface Supplier {
  id: number
  nome: string
  cnpj: string
  id_contato: number
}

// Supplier Address (db.json: fornecedor_endereco)
export interface SupplierAddress {
  id_fornecedor: number
  id_endereco: number
  tipo_endereco: string
}

// Product Supplier (db.json: produto_fornecedor)
export interface ProductSupplier {
  id_produto: number
  id_fornecedor: number
  data_cadastro: string
  usuario_log_id: number | null
}

// Product Allergen (db.json: produtos_alergenos)
export interface ProductAllergen {
  id: number
  nome: string
}

// Movement Registry (db.json: registro_movimentacoes)
export interface MovementRegistry {
  id: number
  id_lote: number
  id_produto: number
  id_usuario: number
  valor_total: number
  data_criacao: string
  usuario_log_id: number | null
  id_localizacao: number
}

// ==========================================
// UI HELPER TYPES (Não existem no db.json)
// ==========================================

// Form Validation
export interface ValidationRule {
  (value: string): boolean | string
}
