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

  async getById (id: number): Promise<Category> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`)
      return response.data
    } catch {
      throw new Error('Erro ao buscar categoria')
    }
  }

  async create (categoryData: Omit<Category, 'id'>): Promise<Category> {
    try {
      const response = await api.get(this.endpoint)
      const categories = new ArrayResponse<Category>(response.data).get()
      
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        ...categoryData,
      }
      
      categories.push(newCategory)
      await api.put(this.endpoint, new ArrayResponse(categories).toNestedArray())
      return newCategory
    } catch {
      throw new Error('Erro ao criar categoria')
    }
  }

  async update (id: number, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
    try {
      const response = await api.get(this.endpoint)
      const categories = new ArrayResponse<Category>(response.data).get()
      const categoryIndex = categories.findIndex(c => c.id === id)
      
      if (categoryIndex === -1) {
        throw new Error('Categoria não encontrada')
      }
      
      const existingCategory = categories[categoryIndex]!
      const updatedCategory: Category = {
        id: existingCategory.id,
        nome: updates.nome ?? existingCategory.nome,
      }
      
      categories[categoryIndex] = updatedCategory
      await api.put(this.endpoint, new ArrayResponse(categories).toNestedArray())
      return updatedCategory
    } catch {
      throw new Error('Erro ao atualizar categoria')
    }
  }

  async delete (id: number): Promise<void> {
    try {
      const response = await api.get(this.endpoint)
      const categories = new ArrayResponse<Category>(response.data).get()
      const updatedCategories = categories.filter((c: Category) => c.id !== id)
      
      await api.put(this.endpoint, new ArrayResponse(updatedCategories).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir categoria')
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

  async getById (id: number): Promise<Brand> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`)
      return response.data
    } catch {
      throw new Error('Erro ao buscar marca')
    }
  }

  async create (brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const response = await api.get(this.endpoint)
      const brands = new ArrayResponse<Brand>(response.data).get()
      
      // Verificar se já existe uma marca com o mesmo nome
      const existingBrand = brands.find(b => b.nome.toLowerCase() === brandData.nome.toLowerCase())
      if (existingBrand) {
        throw new Error('Já existe uma marca com este nome')
      }
      
      const newBrand: Brand = {
        id: Math.max(...brands.map(b => b.id), 0) + 1,
        ...brandData,
      }
      
      brands.push(newBrand)
      await api.put(this.endpoint, new ArrayResponse(brands).toNestedArray())
      return newBrand
    } catch {
      throw new Error('Erro ao criar marca')
    }
  }

  async update (id: number, updates: Partial<Omit<Brand, 'id'>>): Promise<Brand> {
    try {
      const response = await api.get(this.endpoint)
      const brands = new ArrayResponse<Brand>(response.data).get()
      const brandIndex = brands.findIndex(b => b.id === id)
      
      if (brandIndex === -1) {
        throw new Error('Marca não encontrada')
      }
      
      // Verificar se já existe outra marca com o mesmo nome
      if (updates.nome) {
        const existingBrand = brands.find(b => b.id !== id && b.nome.toLowerCase() === updates.nome!.toLowerCase())
        if (existingBrand) {
          throw new Error('Já existe uma marca com este nome')
        }
      }
      
      const existingBrand = brands[brandIndex]!
      const updatedBrand: Brand = {
        id: existingBrand.id,
        nome: updates.nome ?? existingBrand.nome,
      }
      
      brands[brandIndex] = updatedBrand
      await api.put(this.endpoint, new ArrayResponse(brands).toNestedArray())
      return updatedBrand
    } catch {
      throw new Error('Erro ao atualizar marca')
    }
  }

  async delete (id: number): Promise<void> {
    try {
      const response = await api.get(this.endpoint)
      const brands = new ArrayResponse<Brand>(response.data).get()
      const updatedBrands = brands.filter((b: Brand) => b.id !== id)
      
      await api.put(this.endpoint, new ArrayResponse(updatedBrands).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir marca')
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

  async getById (id: number): Promise<UnitMeasure> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`)
      return response.data
    } catch {
      throw new Error('Erro ao buscar unidade de medida')
    }
  }

  async create (unitData: Omit<UnitMeasure, 'id'>): Promise<UnitMeasure> {
    try {
      const response = await api.get(this.endpoint)
      const units = new ArrayResponse<UnitMeasure>(response.data).get()
      
      const newUnit: UnitMeasure = {
        id: Math.max(...units.map(u => u.id), 0) + 1,
        ...unitData,
      }
      
      units.push(newUnit)
      await api.put(this.endpoint, new ArrayResponse(units).toNestedArray())
      return newUnit
    } catch {
      throw new Error('Erro ao criar unidade de medida')
    }
  }

  async update (id: number, updates: Partial<Omit<UnitMeasure, 'id'>>): Promise<UnitMeasure> {
    try {
      const response = await api.get(this.endpoint)
      const units = new ArrayResponse<UnitMeasure>(response.data).get()
      const unitIndex = units.findIndex(u => u.id === id)
      
      if (unitIndex === -1) {
        throw new Error('Unidade de medida não encontrada')
      }
      
      const existingUnit = units[unitIndex]!
      const updatedUnit: UnitMeasure = {
        id: existingUnit.id,
        descricao: updates.descricao ?? existingUnit.descricao,
        abreviacao: updates.abreviacao ?? existingUnit.abreviacao,
      }
      
      units[unitIndex] = updatedUnit
      await api.put(this.endpoint, new ArrayResponse(units).toNestedArray())
      return updatedUnit
    } catch {
      throw new Error('Erro ao atualizar unidade de medida')
    }
  }

  async delete (id: number): Promise<void> {
    try {
      const response = await api.get(this.endpoint)
      const units = new ArrayResponse<UnitMeasure>(response.data).get()
      const updatedUnits = units.filter((u: UnitMeasure) => u.id !== id)
      
      await api.put(this.endpoint, new ArrayResponse(updatedUnits).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir unidade de medida')
    }
  }
}

export const ProductService = new ProductServiceClass()
export const CategoryService = new CategoryServiceClass()
export const BrandService = new BrandServiceClass()
export const UnitMeasureService = new UnitMeasureServiceClass()
