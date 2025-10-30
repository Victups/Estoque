/**
 * Exportação centralizada de todos os serviços
 */

// Serviços de endereços (locais)
export { AddressService } from './locais/address.service'
export type { AddressEnriched } from './locais/address.service'

// Configuração e utilitários
export { api, ApiError, ArrayResponse } from './api.config'

// Serviços de autenticação
export { AuthService } from './auth.service'
// Serviços de localizações (locais)
export {
  DepositService,
  LocationService,
} from './locais/location.service'
export type { DepositEnriched, LocationComplete } from './locais/location.service'

// Serviços de lotes
export { LoteService } from './lote.service'
export type { LoteComplete, LoteEnriched } from './lote.service'

// Serviços de movimentações
export { MovementService } from './movement.service'
// Serviços de produtos
export {
  BrandService,
  CategoryService,
  ProductService,
  UnitMeasureService,
} from './product.service'

export type { ProductEnriched } from './product.service'

// Serviços de fornecedores e contatos
export {
  ContactService,
  SupplierService,
} from './supplier.service'
export type { SupplierEnriched } from './supplier.service'

// Serviços de UF e municípios (locais)
export {
  MunicipalityService,
  UfService,
} from './locais/uf.service'
// Serviços de usuários
export { UserService } from './user.service'
