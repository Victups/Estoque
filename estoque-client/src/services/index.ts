/**
 * Exportação centralizada de todos os serviços
 */

// Configuração e utilitários
export { api, ApiError, ArrayResponse } from './api.config'
export { API_ROUTES } from './api.routes'

// Serviços de autenticação
export { AuthService } from './auth/auth.service'
export { clearSession, getStoredToken, getStoredUser, saveSession, setStoredUser } from './auth/auth.storage'

// Serviços de usuários
export { UserService } from './usuarios/user.service'

// Serviços de produtos
export {
  BrandService,
  CategoryService,
  ProductService,
  UnitMeasureService,
} from './produtos/product.service'

export type { ProductDetail, ProductEnriched, ProductFornecedorLink, ProductLoteResumo } from './produtos/product.service'
export { DashboardService, type DashboardStats } from './dashboards/dashboard.service'
export { UserStatsService, type UserStats } from './usuarios/user.stats.service'

// Serviços de lotes
export { LoteService } from './lotes/lote.service'
export type { CreateLoteInput, LoteComplete, LoteEnriched } from './lotes/lote.service'

// Serviços de movimentações
export { MovementService } from './movimentacoes/movement.service'

// Serviços de fornecedores e contatos
export {
  ContactService,
  SupplierService,
} from './fornecedores/supplier.service'

export type { SupplierEnriched } from './fornecedores/supplier.service'

// Serviços de endereços (locais)
export { AddressService } from './locais/address.service'
export type { AddressEnriched } from './locais/address.service'

// Serviços de localizações (locais)
export {
  DepositService,
  LocationService,
} from './locais/location.service'

export type { DepositEnriched, LocationComplete } from './locais/location.service'

// Serviços de UF e municípios (locais)
export {
  MunicipalityService,
  UfService,
} from './locais/uf.service'
