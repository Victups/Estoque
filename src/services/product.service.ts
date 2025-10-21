import type { Brand, Category, Product, UnitMeasure } from '@/types'

import { api, ArrayResponse } from './api.config'

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

/**
 * Serviço de API para Produtos
 */
class ProductServiceClass {
  private endpoint = '/produtos'

  async getAll (): Promise<Product[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Product>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar produtos')
    }
  }

  /**
   * Busca produtos ENRIQUECIDOS com dados dos relacionamentos
   */
  async getAllEnriched (): Promise<ProductEnriched[]> {
    try {
      const [products, categories, brands, units] = await Promise.all([
        this.getAll(),
        CategoryService.getAll(),
        BrandService.getAll(),
        UnitMeasureService.getAll(),
      ])

      const categoryMap = new Map(categories.map(c => [c.id, c]))
      const brandMap = new Map(brands.map(b => [b.id, b]))
      const unitMap = new Map(units.map(u => [u.id, u]))

      return products.map(product => {
        const categoria = categoryMap.get(product.id_categoria)
        const marca = brandMap.get(product.id_marca)
        const unidade = unitMap.get(product.id_unidade_medida)

        return {
          ...product,
          categoria_nome: categoria?.nome,
          marca_nome: marca?.nome,
          unidade_abreviacao: unidade?.abreviacao,
          unidade_descricao: unidade?.descricao,
        }
      })
    } catch {
      throw new Error('Erro ao buscar produtos enriquecidos')
    }
  }

  async getById (id: number): Promise<Product | undefined> {
    const products = await this.getAll()
    return products.find((p: Product) => p.id === id)
  }

  async create (productData: Omit<Product, 'id'>): Promise<Product> {
    const products = await this.getAll()

    const newId: number = products.length > 0
      ? Math.max(...products.map((p: Product) => p.id)) + 1
      : 1

    // Gerar código automaticamente se não fornecido (simula trigger do banco)
    const codigo = productData.codigo && productData.codigo.trim() !== ''
      ? productData.codigo
      : `PROD${newId.toString().padStart(3, '0')}`

    const newProduct: Product = {
      ...productData,
      id: newId,
      codigo,
    }

    products.push(newProduct)

    try {
      await api.put(this.endpoint, new ArrayResponse(products).toNestedArray())
      return newProduct
    } catch {
      throw new Error('Erro ao criar produto')
    }
  }

  async update (id: number, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const products = await this.getAll()
    const productIndex = products.findIndex((p: Product) => p.id === id)

    if (productIndex === -1) {
      throw new Error('Produto não encontrado')
    }

    const existingProduct = products[productIndex]
    if (!existingProduct) {
      throw new Error('Produto não encontrado')
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      id: existingProduct.id,
    }

    products[productIndex] = updatedProduct

    try {
      await api.put(this.endpoint, new ArrayResponse(products).toNestedArray())
      return updatedProduct
    } catch {
      throw new Error('Erro ao atualizar produto')
    }
  }

  async delete (id: number): Promise<void> {
    const products = await this.getAll()
    const updatedProducts = products.filter((p: Product) => p.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updatedProducts).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir produto')
    }
  }
}

/**
 * Serviço de API para Categorias
 */
class CategoryServiceClass {
  private endpoint = '/categorias'

  async getAll (): Promise<Category[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Category>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar categorias')
    }
  }
}

/**
 * Serviço de API para Marcas
 */
class BrandServiceClass {
  private endpoint = '/marcas'

  async getAll (): Promise<Brand[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Brand>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar marcas')
    }
  }
}

/**
 * Serviço de API para Unidades de Medida
 */
class UnitMeasureServiceClass {
  private endpoint = '/unidade_medidas'

  async getAll (): Promise<UnitMeasure[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<UnitMeasure>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar unidades de medida')
    }
  }
}

export const ProductService = new ProductServiceClass()
export const CategoryService = new CategoryServiceClass()
export const BrandService = new BrandServiceClass()
export const UnitMeasureService = new UnitMeasureServiceClass()
