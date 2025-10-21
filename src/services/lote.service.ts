import type { ProductLote } from '@/types'

import { api, ArrayResponse } from './api.config'
import { LocationService } from './location.service'
import { ProductService } from './product.service'

/**
 * Interface para lote enriquecido básico
 */
export interface LoteEnriched extends ProductLote {
  produto_nome?: string
  produto_codigo?: string
  localizacao_nome?: string
}

/**
 * Interface para lote com localização COMPLETA (até UF)
 */
export interface LoteComplete extends ProductLote {
  // Produto
  produto_nome?: string
  produto_codigo?: string

  // Localização física
  localizacao_corredor?: string
  localizacao_prateleira?: string
  localizacao_secao?: string

  // Depósito
  deposito_nome?: string

  // Endereço
  endereco_completo?: string
  endereco_cep?: string

  // Município
  municipio_nome?: string
  municipio_bairro?: string

  // UF
  uf_sigla?: string
  uf_nome?: string
  uf_id?: number

  // Formatado para exibição
  localizacao_completa?: string
}

/**
 * Serviço de API para Lotes de Produtos
 */
class LoteServiceClass {
  private endpoint = '/produto_lotes'

  async getAll (): Promise<ProductLote[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<ProductLote>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar lotes')
    }
  }

  /**
   * Busca lotes ENRIQUECIDOS com dados básicos
   */
  async getAllEnriched (): Promise<LoteEnriched[]> {
    try {
      const [lotes, products, locations] = await Promise.all([
        this.getAll(),
        ProductService.getAll(),
        LocationService.getAll(),
      ])

      const productMap = new Map(products.map(p => [p.id, p]))
      const locationMap = new Map(locations.map(l => [l.id, l]))

      return lotes.map(lote => {
        const produto = productMap.get(lote.id_produto)
        const localizacao = lote.id_localizacao ? locationMap.get(lote.id_localizacao) : null

        return {
          ...lote,
          produto_nome: produto?.nome,
          produto_codigo: produto?.codigo,
          localizacao_nome: localizacao
            ? `${localizacao.corredor} - ${localizacao.prateleira} - ${localizacao.secao}`
            : undefined,
        }
      })
    } catch {
      throw new Error('Erro ao buscar lotes enriquecidos')
    }
  }

  /**
   * Busca lotes com LOCALIZAÇÃO COMPLETA (até UF)
   * @param ufId - ID da UF para filtrar (opcional)
   */
  async getAllComplete (ufId?: number | null): Promise<LoteComplete[]> {
    try {
      const [lotes, products, locationsComplete] = await Promise.all([
        this.getAll(),
        ProductService.getAll(),
        LocationService.getAllComplete(ufId),
      ])

      const productMap = new Map(products.map(p => [p.id, p]))
      const locationMap = new Map(locationsComplete.map(l => [l.id, l]))

      // Filtrar lotes pela UF se fornecida
      const lotesFiltrados = lotes.filter(lote => {
        if (ufId !== undefined && ufId !== null) {
          const loc = lote.id_localizacao ? locationMap.get(lote.id_localizacao) : null
          return loc?.uf_id === ufId
        }
        return true
      })

      return lotesFiltrados.map(lote => {
        const produto = productMap.get(lote.id_produto)
        const loc = lote.id_localizacao ? locationMap.get(lote.id_localizacao) : null

        return {
          ...lote,
          // Produto
          produto_nome: produto?.nome,
          produto_codigo: produto?.codigo,

          // Localização física
          localizacao_corredor: loc?.corredor,
          localizacao_prateleira: loc?.prateleira,
          localizacao_secao: loc?.secao,

          // Depósito
          deposito_nome: loc?.deposito_nome,

          // Endereço
          endereco_completo: loc?.endereco_completo,
          endereco_cep: loc?.endereco_cep,

          // Município
          municipio_nome: loc?.municipio_nome,
          municipio_bairro: loc?.municipio_bairro,

          // UF
          uf_sigla: loc?.uf_sigla,
          uf_nome: loc?.uf_nome,
          uf_id: loc?.uf_id,

          // Formatado
          localizacao_completa: loc?.localizacao_completa,
        }
      })
    } catch {
      throw new Error('Erro ao buscar lotes completos')
    }
  }

  async getById (id: number): Promise<ProductLote | undefined> {
    const lotes = await this.getAll()
    return lotes.find((l: ProductLote) => l.id === id)
  }

  async getByProduct (productId: number): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    return lotes.filter((l: ProductLote) => l.id_produto === productId)
  }

  /**
   * Busca lotes disponíveis de um produto ordenados por FIFO (validade)
   */
  async getAvailableByProductFIFO (productId: number): Promise<ProductLote[]> {
    const lotes = await this.getByProduct(productId)

    // Filtrar apenas lotes com quantidade disponível
    const disponíveis = lotes.filter(l => l.quantidade > 0)

    // Ordenar por data de validade (FIFO - First In, First Out)
    return disponíveis.sort((a, b) =>
      new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime(),
    )
  }

  async getByLocation (locationId: number): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    return lotes.filter((l: ProductLote) => l.id_localizacao === locationId)
  }

  async getExpiringSoon (days = 30): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    const today = new Date()
    const limitDate = new Date()
    limitDate.setDate(today.getDate() + days)

    return lotes.filter((l: ProductLote) => {
      const expiryDate = new Date(l.data_validade)
      return expiryDate >= today && expiryDate <= limitDate
    })
  }

  async create (loteData: Omit<ProductLote, 'id'>): Promise<ProductLote> {
    const lotes = await this.getAll()

    const newId: number = lotes.length > 0
      ? Math.max(...lotes.map((l: ProductLote) => l.id)) + 1
      : 1

    // Gerar código automaticamente se não fornecido (simula trigger do banco)
    const codigoLote = loteData.codigo_lote && loteData.codigo_lote.trim() !== ''
      ? loteData.codigo_lote
      : `L${newId.toString().padStart(3, '0')}`

    const newLote: ProductLote = {
      ...loteData,
      id: newId,
      codigo_lote: codigoLote,
    }

    lotes.push(newLote)

    try {
      await api.put(this.endpoint, new ArrayResponse(lotes).toNestedArray())
      return newLote
    } catch {
      throw new Error('Erro ao criar lote')
    }
  }

  async update (id: number, updates: Partial<Omit<ProductLote, 'id'>>): Promise<ProductLote> {
    const lotes = await this.getAll()
    const loteIndex = lotes.findIndex((l: ProductLote) => l.id === id)

    if (loteIndex === -1) {
      throw new Error('Lote não encontrado')
    }

    const existingLote = lotes[loteIndex]
    if (!existingLote) {
      throw new Error('Lote não encontrado')
    }

    const updatedLote: ProductLote = {
      ...existingLote,
      ...updates,
      id: existingLote.id,
    }

    lotes[loteIndex] = updatedLote

    try {
      await api.put(this.endpoint, new ArrayResponse(lotes).toNestedArray())
      return updatedLote
    } catch {
      throw new Error('Erro ao atualizar lote')
    }
  }

  async delete (id: number): Promise<void> {
    const lotes = await this.getAll()
    const updatedLotes = lotes.filter((l: ProductLote) => l.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updatedLotes).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir lote')
    }
  }
}

export const LoteService = new LoteServiceClass()
