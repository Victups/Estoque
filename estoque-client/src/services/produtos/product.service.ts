import type {
  Brand,
  CategoriaApi,
  Category,
  MarcaApi,
  Product,
  ProductDetail,
  ProductFornecedorLink,
  ProductLoteResumo,
  ProdutoApi,
  UnidadeApi,
  UnitMeasure,
} from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

function toNumber (value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function mapProductBase (produto: ProdutoApi): Product {
  return {
    id: produto.id,
    nome: produto.nome,
    codigo: produto.codigo,
    descricao: produto.descricao ?? undefined,
    id_unidade_medida: produto.unidadeMedida?.id ?? 0,
    id_marca: produto.marca?.id ?? null,
    id_categoria: produto.categoria?.id ?? null,
    responsavel_cadastro: produto.responsavelCadastro?.id ?? 0,
    data_cadastro: produto.dataCadastro ?? produto.createdAt ?? undefined,
    usuario_log_id: produto.usuarioLogId ?? null,
    estoque_minimo: toNumber(produto.estoqueMinimo, 0),
    is_perecivel: Boolean(produto.isPerecivel),
    ativo: produto.ativo ?? true,
  }
}

/**
 * Interface para produto enriquecido com dados relacionados
 */
export interface ProductEnriched extends Product {
  categoria_nome?: string
  marca_nome?: string
  unidade_abreviacao?: string
  unidade_descricao?: string
  responsavel_nome?: string
}

function mapProductEnriched (produto: ProdutoApi): ProductEnriched {
  return {
    ...mapProductBase(produto),
    categoria_nome: produto.categoria?.nome,
    marca_nome: produto.marca?.nome,
    unidade_abreviacao: produto.unidadeMedida?.abreviacao as UnitMeasure['abreviacao'] | undefined,
    unidade_descricao: produto.unidadeMedida?.descricao,
    responsavel_nome: produto.responsavelCadastro?.nome,
  }
}

function mapProductDetail (produto: ProdutoApi): ProductDetail {
  return {
    ...mapProductBase(produto),
    categoria_nome: produto.categoria?.nome,
    marca_nome: produto.marca?.nome,
    unidade_abreviacao: produto.unidadeMedida?.abreviacao as UnitMeasure['abreviacao'] | undefined,
    unidade_descricao: produto.unidadeMedida?.descricao,
    responsavel_nome: produto.responsavelCadastro?.nome,
    usuario_log_nome: produto.usuarioLog?.nome,
    criado_por_nome: produto.createdBy?.nome,
    atualizado_por_nome: produto.updatedBy?.nome,
    created_at: produto.createdAt ?? undefined,
    updated_at: produto.updatedAt ?? undefined,
    fornecedores: produto.fornecedores?.map<ProductFornecedorLink>(fornecedor => ({
      id_fornecedor: fornecedor.fornecedor?.id ?? fornecedor.id_fornecedor,
      nome: fornecedor.fornecedor?.nome ?? `Fornecedor ${fornecedor.id_fornecedor}`,
      cnpj: fornecedor.fornecedor?.cnpj ?? null,
    })) ?? [],
    lotes: produto.lotes?.map<ProductLoteResumo>(lote => ({
      id: lote.id,
      codigo_lote: lote.codigo_lote,
      quantidade: toNumber(lote.quantidade, 0),
      data_validade: lote.data_validade ?? null,
      id_localizacao: lote.localizacao?.id ?? null,
    })) ?? [],
  }
}

function cleanPayload<T extends Record<string, unknown>> (payload: T): T {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  return Object.fromEntries(entries) as T
}

type CreateProdutoPayload = {
  nome: string
  descricao?: string
  codigo?: string
  id_unidade_medida: number
  id_marca?: number
  id_categoria?: number
  responsavel_cadastro: number
  usuario_log_id?: number
  estoque_minimo?: number
  ativo?: boolean
  is_perecivel?: boolean
}

/**
 * Serviço de API para Produtos
 */
class ProductServiceClass {
  async getAll (): Promise<Product[]> {
    const produtos = await this.fetchAll()
    return produtos.map(produto => mapProductBase(produto))
  }

  /**
   * Busca produtos ENRIQUECIDOS com dados dos relacionamentos
   */
  async getAllEnriched (): Promise<ProductEnriched[]> {
    const produtos = await this.fetchAll()
    return produtos.map(produto => mapProductEnriched(produto))
  }

  async getById (id: number): Promise<Product> {
    const { data } = await api.get<ProdutoApi>(API_ROUTES.produtos.byId(id))
    return mapProductBase(data)
  }

  async getDetail (id: number): Promise<ProductDetail> {
    const { data } = await api.get<ProdutoApi>(API_ROUTES.produtos.byId(id))
    return mapProductDetail(data)
  }

  async create (productData: Omit<Product, 'id'>): Promise<Product> {
    const payload: CreateProdutoPayload = cleanPayload({
      nome: productData.nome,
      descricao: productData.descricao,
      codigo: productData.codigo?.trim() || undefined,
      id_unidade_medida: productData.id_unidade_medida,
      id_marca: productData.id_marca ?? undefined,
      id_categoria: productData.id_categoria ?? undefined,
      responsavel_cadastro: productData.responsavel_cadastro,
      usuario_log_id: productData.usuario_log_id ?? undefined,
      estoque_minimo: productData.estoque_minimo,
      ativo: productData.ativo,
      is_perecivel: productData.is_perecivel,
    })

    const { data } = await api.post<ProdutoApi>(API_ROUTES.produtos.base, payload)
    return mapProductBase(data)
  }

  async update (id: number, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const payload = cleanPayload({
      nome: updates.nome,
      descricao: updates.descricao,
      codigo: updates.codigo?.trim(),
      id_unidade_medida: updates.id_unidade_medida,
      id_marca: updates.id_marca,
      id_categoria: updates.id_categoria,
      responsavel_cadastro: updates.responsavel_cadastro,
      usuario_log_id: updates.usuario_log_id,
      estoque_minimo: updates.estoque_minimo,
      ativo: updates.ativo,
      is_perecivel: updates.is_perecivel,
    })

    const { data } = await api.patch<ProdutoApi>(API_ROUTES.produtos.byId(id), payload)
    return mapProductBase(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.produtos.byId(id))
  }

  async linkToSupplier (productId: number, supplierId: number, usuarioLogId?: number | null): Promise<void> {
    await api.post(API_ROUTES.produtoFornecedor.base, {
      id_produto: productId,
      id_fornecedor: supplierId,
      usuario_log_id: usuarioLogId ?? null,
    })
  }

  async unlinkFromSupplier (productId: number, supplierId: number): Promise<void> {
    await api.delete(`${API_ROUTES.produtoFornecedor.base}/${productId}/${supplierId}`)
  }

  private async fetchAll (): Promise<ProdutoApi[]> {
    const { data } = await api.get<ProdutoApi[]>(API_ROUTES.produtos.base)
    return data
  }
}

/**
 * Serviço de API para Categorias
 */
class CategoryServiceClass {
  async getAll (): Promise<Category[]> {
    const { data } = await api.get<CategoriaApi[]>(API_ROUTES.categorias.base)
    return data
  }

  async getById (id: number): Promise<Category> {
    const { data } = await api.get<CategoriaApi>(API_ROUTES.categorias.byId(id))
    return data
  }

  async create (categoryData: Omit<Category, 'id'>): Promise<Category> {
    const { data } = await api.post<CategoriaApi>(API_ROUTES.categorias.base, categoryData)
    return data
  }

  async update (id: number, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const { data } = await api.patch<CategoriaApi>(API_ROUTES.categorias.byId(id), cleanPayload(updates))
    return data
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.categorias.byId(id))
  }
}

/**
 * Serviço de API para Marcas
 */
class BrandServiceClass {
  async getAll (): Promise<Brand[]> {
    const { data } = await api.get<MarcaApi[]>(API_ROUTES.marcas.base)
    return data
  }

  async getById (id: number): Promise<Brand> {
    const { data } = await api.get<MarcaApi>(API_ROUTES.marcas.byId(id))
    return data
  }

  async create (brandData: Omit<Brand, 'id'>): Promise<Brand> {
    const { data } = await api.post<MarcaApi>(API_ROUTES.marcas.base, brandData)
    return data
  }

  async update (id: number, updates: Partial<Omit<Brand, 'id'>>): Promise<Brand> {
    const { data } = await api.patch<MarcaApi>(API_ROUTES.marcas.byId(id), cleanPayload(updates))
    return data
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.marcas.byId(id))
  }
}

/**
 * Serviço de API para Unidades de Medida
 */
class UnitMeasureServiceClass {
  async getAll (): Promise<UnitMeasure[]> {
    const { data } = await api.get<UnidadeApi[]>(API_ROUTES.unidades.base)
    return data
  }

  async getById (id: number): Promise<UnitMeasure> {
    const { data } = await api.get<UnidadeApi>(API_ROUTES.unidades.byId(id))
    return data
  }

  async create (unitData: Omit<UnitMeasure, 'id'>): Promise<UnitMeasure> {
    const { data } = await api.post<UnidadeApi>(API_ROUTES.unidades.base, unitData)
    return data
  }

  async update (id: number, updates: Partial<Omit<UnitMeasure, 'id'>>): Promise<UnitMeasure> {
    const { data } = await api.patch<UnidadeApi>(API_ROUTES.unidades.byId(id), cleanPayload(updates))
    return data
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.unidades.byId(id))
  }
}

export const ProductService = new ProductServiceClass()
export const CategoryService = new CategoryServiceClass()
export const BrandService = new BrandServiceClass()
export const UnitMeasureService = new UnitMeasureServiceClass()

export { type ProductDetail, type ProductFornecedorLink, type ProductLoteResumo } from '@/interfaces'

