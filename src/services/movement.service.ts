import type { MovementDisplay, StockMovement } from '@/types'

import { api, ArrayResponse } from './api.config'
import { LocationService } from './locais/location.service'
import { LoteService } from './lote.service'
import { ProductService } from './product.service'
import { UserService } from './user.service'

/**
 * Serviço de API para Movimentações de Estoque
 */
class MovementServiceClass {
  private endpoint = '/movimentacao_estoque'

  async getAll (): Promise<StockMovement[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<StockMovement>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar movimentações')
    }
  }

  /**
   * Busca movimentações ENRIQUECIDAS com dados dos relacionamentos
   */
  async getAllEnriched (): Promise<MovementDisplay[]> {
    try {
      // Buscar todos os dados necessários em paralelo
      const [movements, products, users, lotes, locations] = await Promise.all([
        this.getAll(),
        ProductService.getAll(),
        UserService.getAll(),
        LoteService.getAll(),
        LocationService.getAll(),
      ])

      // Criar mapas para lookup rápido
      const productMap = new Map(products.map(p => [p.id, p]))
      const userMap = new Map(users.map(u => [u.id, u]))
      const loteMap = new Map(lotes.map(l => [l.id, l]))
      const locationMap = new Map(locations.map(l => [l.id, l]))

      // Enriquecer movimentações com dados relacionados
      return movements.map(mov => {
        const produto = productMap.get(mov.id_produto)
        const usuario = userMap.get(mov.id_usuario)
        const lote = loteMap.get(mov.id_lote)
        const locOrigem = mov.id_localizacao_origem ? locationMap.get(mov.id_localizacao_origem) : null
        const locDestino = mov.id_localizacao_destino ? locationMap.get(mov.id_localizacao_destino) : null

        return {
          ...mov,
          produto_nome: produto?.nome,
          usuario_nome: usuario?.nome,
          lote_codigo: lote?.codigo_lote,
          localizacao_origem_nome: locOrigem
            ? `${locOrigem.corredor} - ${locOrigem.prateleira} - ${locOrigem.secao}`
            : undefined,
          localizacao_destino_nome: locDestino
            ? `${locDestino.corredor} - ${locDestino.prateleira} - ${locDestino.secao}`
            : undefined,
        }
      })
    } catch (error) {
      console.error('Erro ao buscar movimentações enriquecidas:', error)
      throw new Error('Erro ao buscar movimentações')
    }
  }

  async getById (id: number): Promise<StockMovement | undefined> {
    const movements = await this.getAll()
    return movements.find((m: StockMovement) => m.id === id)
  }

  async getByProduct (productId: number): Promise<StockMovement[]> {
    const movements = await this.getAll()
    return movements.filter((m: StockMovement) => m.id_produto === productId)
  }

  async getByType (type: 'entrada' | 'saida'): Promise<StockMovement[]> {
    const movements = await this.getAll()
    return movements.filter((m: StockMovement) => m.tipo_movimento === type)
  }

  async create (movementData: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const movements = await this.getAll()

    const newId: number = movements.length > 0
      ? Math.max(...movements.map((m: StockMovement) => m.id)) + 1
      : 1

    const newMovement: StockMovement = {
      ...movementData,
      id: newId,
      data_mov: new Date().toISOString(),
    }

    movements.push(newMovement)

    try {
      await api.put(this.endpoint, new ArrayResponse(movements).toNestedArray())
      return newMovement
    } catch {
      throw new Error('Erro ao criar movimentação')
    }
  }

  async update (id: number, updates: Partial<Omit<StockMovement, 'id'>>): Promise<StockMovement> {
    const movements = await this.getAll()
    const movementIndex = movements.findIndex((m: StockMovement) => m.id === id)

    if (movementIndex === -1) {
      throw new Error('Movimentação não encontrada')
    }

    const existingMovement = movements[movementIndex]
    if (!existingMovement) {
      throw new Error('Movimentação não encontrada')
    }

    const updatedMovement: StockMovement = {
      ...existingMovement,
      ...updates,
      id: existingMovement.id,
    }

    movements[movementIndex] = updatedMovement

    try {
      await api.put(this.endpoint, new ArrayResponse(movements).toNestedArray())
      return updatedMovement
    } catch {
      throw new Error('Erro ao atualizar movimentação')
    }
  }

  async delete (id: number): Promise<void> {
    const movements = await this.getAll()
    const updatedMovements = movements.filter((m: StockMovement) => m.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updatedMovements).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir movimentação')
    }
  }
}

export const MovementService = new MovementServiceClass()
