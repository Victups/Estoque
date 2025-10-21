import type { Deposit, Location } from '@/types'

import { AddressService } from './address.service'
import { api, ArrayResponse } from './api.config'

/**
 * Interface para localização COMPLETA (com toda hierarquia)
 */
export interface LocationComplete extends Location {
  // Depósito
  deposito_nome?: string
  deposito_id?: number

  // Endereço
  endereco_completo?: string
  endereco_cep?: string
  endereco_id?: number

  // Município
  municipio_nome?: string
  municipio_bairro?: string
  municipio_id?: number

  // UF
  uf_sigla?: string
  uf_nome?: string
  uf_id?: number

  // Formatado para exibição
  localizacao_completa?: string
}

/**
 * Serviço de API para Localizações
 */
class LocationServiceClass {
  private endpoint = '/localizacoes'

  async getAll (): Promise<Location[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Location>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar localizações')
    }
  }

  /**
   * Busca localização COMPLETA com toda hierarquia até UF
   * @param ufId - ID da UF para filtrar (opcional)
   */
  async getAllComplete (ufId?: number | null): Promise<LocationComplete[]> {
    try {
      console.log('🔍 LocationService.getAllComplete - UF ID:', ufId)
      
      const [locations, deposits, addresses] = await Promise.all([
        this.getAll(),
        DepositService.getAllEnriched(ufId),
        AddressService.getAllEnriched(ufId),
      ])
      
      console.log('✅ Dados carregados:', {
        locations: locations.length,
        deposits: deposits.length,
        addresses: addresses.length,
      })

      const depositMap = new Map(deposits.map(d => [d.id, d]))
      const addressMap = new Map(addresses.map(a => [a.id, a]))

      const locationsFiltradas = locations.filter(loc => {
        const deposito = depositMap.get(loc.id_deposito)
        if (!deposito) return false

        // Se foi passado ufId, filtrar apenas dessa UF
        if (ufId !== undefined && ufId !== null) {
          const endereco = addressMap.get(deposito.id_endereco)
          return endereco?.uf_id === ufId
        }

        return true
      })

      return locationsFiltradas.map(loc => {
        const deposito = depositMap.get(loc.id_deposito)
        const endereco = deposito ? addressMap.get(deposito.id_endereco) : null

        const localizacao_completa = [
          endereco?.uf_sigla,
          endereco?.municipio_nome,
          deposito?.nome,
          `${loc.corredor}-${loc.prateleira}-${loc.secao}`,
        ].filter(Boolean).join(' / ')

        return {
          ...loc,
          // Depósito
          deposito_nome: deposito?.nome,
          deposito_id: deposito?.id,

          // Endereço
          endereco_completo: endereco
            ? `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ' - ' + endereco.complemento : ''}`
            : undefined,
          endereco_cep: endereco?.cep,
          endereco_id: endereco?.id,

          // Município
          municipio_nome: endereco?.municipio_nome,
          municipio_bairro: endereco?.municipio_bairro,
          municipio_id: endereco?.municipio_id,

          // UF
          uf_sigla: endereco?.uf_sigla,
          uf_nome: endereco?.uf_nome,
          uf_id: endereco?.uf_id,

          // Formatado
          localizacao_completa,
        }
      })
    } catch (error) {
      console.error('Erro detalhado em getAllComplete:', error)
      throw new Error('Erro ao buscar localizações completas')
    }
  }

  async getById (id: number): Promise<Location | undefined> {
    const locations = await this.getAll()
    return locations.find((l: Location) => l.id === id)
  }

  async getByDeposit (depositId: number): Promise<Location[]> {
    const locations = await this.getAll()
    return locations.filter((l: Location) => l.id_deposito === depositId)
  }

  async create (locationData: Omit<Location, 'id'>): Promise<Location> {
    const locations = await this.getAll()

    const newId: number = locations.length > 0
      ? Math.max(...locations.map((l: Location) => l.id)) + 1
      : 1

    const newLocation: Location = {
      ...locationData,
      id: newId,
    }

    locations.push(newLocation)

    try {
      await api.put(this.endpoint, new ArrayResponse(locations).toNestedArray())
      return newLocation
    } catch {
      throw new Error('Erro ao criar localização')
    }
  }

  async update (id: number, updates: Partial<Omit<Location, 'id'>>): Promise<Location> {
    const locations = await this.getAll()
    const locationIndex = locations.findIndex((l: Location) => l.id === id)

    if (locationIndex === -1) {
      throw new Error('Localização não encontrada')
    }

    const existingLocation = locations[locationIndex]
    if (!existingLocation) {
      throw new Error('Localização não encontrada')
    }

    const updatedLocation: Location = {
      ...existingLocation,
      ...updates,
      id: existingLocation.id,
    }

    locations[locationIndex] = updatedLocation

    try {
      await api.put(this.endpoint, new ArrayResponse(locations).toNestedArray())
      return updatedLocation
    } catch {
      throw new Error('Erro ao atualizar localização')
    }
  }

  async delete (id: number): Promise<void> {
    const locations = await this.getAll()
    const updatedLocations = locations.filter((l: Location) => l.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updatedLocations).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir localização')
    }
  }
}

/**
 * Interface para depósito enriquecido
 */
export interface DepositEnriched extends Deposit {
  endereco_completo?: string
  endereco_cep?: string
  municipio_nome?: string
  municipio_bairro?: string
  uf_sigla?: string
  uf_nome?: string
}

/**
 * Serviço de API para Depósitos
 */
class DepositServiceClass {
  private endpoint = '/depositos'

  async getAll (): Promise<Deposit[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Deposit>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar depósitos')
    }
  }

  /**
   * Busca depósitos ENRIQUECIDOS com endereço completo até UF
   * @param ufId - ID da UF para filtrar (opcional)
   */
  async getAllEnriched (ufId?: number | null): Promise<DepositEnriched[]> {
    try {
      const [deposits, addresses] = await Promise.all([
        this.getAll(),
        AddressService.getAllEnriched(ufId),
      ])

      const addressMap = new Map(addresses.map(a => [a.id, a]))

      // Filtrar depósitos pela UF se fornecida
      const depositsFiltrados = deposits.filter(deposit => {
        if (ufId !== undefined && ufId !== null) {
          const endereco = addressMap.get(deposit.id_endereco)
          return endereco?.uf_id === ufId
        }
        return true
      })

      return depositsFiltrados.map(deposit => {
        const endereco = addressMap.get(deposit.id_endereco)

        return {
          ...deposit,
          endereco_completo: endereco
            ? `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ' - ' + endereco.complemento : ''}`
            : undefined,
          endereco_cep: endereco?.cep,
          municipio_nome: endereco?.municipio_nome,
          municipio_bairro: endereco?.municipio_bairro,
          uf_sigla: endereco?.uf_sigla,
          uf_nome: endereco?.uf_nome,
        }
      })
    } catch (error) {
      console.error('Erro detalhado em DepositService.getAllEnriched:', error)
      throw new Error('Erro ao buscar depósitos enriquecidos')
    }
  }

  async getById (id: number): Promise<Deposit | undefined> {
    const deposits = await this.getAll()
    return deposits.find((d: Deposit) => d.id === id)
  }
}

export const LocationService = new LocationServiceClass()
export const DepositService = new DepositServiceClass()
