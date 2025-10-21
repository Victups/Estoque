import type { Address } from '@/types'

import { api, ArrayResponse } from './api.config'
import { MunicipalityService, UfService } from './uf.service'

/**
 * Interface para endereço enriquecido
 */
export interface AddressEnriched extends Address {
  municipio_nome?: string
  municipio_bairro?: string
  municipio_id?: number
  uf_sigla?: string
  uf_nome?: string
  uf_id?: number
}

/**
 * Serviço de API para Endereços
 */
class AddressServiceClass {
  private endpoint = '/enderecos'

  async getAll (): Promise<Address[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Address>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar endereços')
    }
  }

  /**
   * Busca endereços ENRIQUECIDOS com município e UF
   * @param ufId - ID da UF para filtrar (opcional)
   */
  async getAllEnriched (ufId?: number | null): Promise<AddressEnriched[]> {
    try {
      console.log('🔍 AddressService.getAllEnriched - UF ID:', ufId)

      const [addresses, municipalities, ufs] = await Promise.all([
        this.getAll(),
        MunicipalityService.getAll(),
        UfService.getAll(),
      ])

      console.log('✅ AddressService dados:', {
        addresses: addresses.length,
        municipalities: municipalities.length,
        ufs: ufs.length,
      })

      const municipalityMap = new Map(municipalities.map(m => [m.id, m]))
      const ufMap = new Map(ufs.map(u => [u.id, u]))

      // Filtrar endereços pela UF se fornecida
      const addressesFiltrados = addresses.filter(address => {
        if (ufId !== undefined && ufId !== null) {
          const municipio = municipalityMap.get(address.id_municipio)
          return municipio?.id_uf === ufId
        }
        return true
      })

      return addressesFiltrados.map(address => {
        const municipio = municipalityMap.get(address.id_municipio)
        const uf = municipio ? ufMap.get(municipio.id_uf) : null

        return {
          ...address,
          municipio_nome: municipio?.nome,
          municipio_bairro: municipio?.bairro,
          municipio_id: municipio?.id,
          uf_sigla: uf?.sigla,
          uf_nome: uf?.nome,
          uf_id: uf?.id,
        }
      })
    } catch (error) {
      console.error('Erro detalhado em AddressService.getAllEnriched:', error)
      throw new Error('Erro ao buscar endereços enriquecidos')
    }
  }

  async getById (id: number): Promise<Address | undefined> {
    const addresses = await this.getAll()
    return addresses.find((a: Address) => a.id === id)
  }

  async create (addressData: Omit<Address, 'id'>): Promise<Address> {
    const addresses = await this.getAll()

    const newId: number = addresses.length > 0
      ? Math.max(...addresses.map((a: Address) => a.id)) + 1
      : 1

    const newAddress: Address = {
      ...addressData,
      id: newId,
    }

    addresses.push(newAddress)

    try {
      await api.put(this.endpoint, new ArrayResponse(addresses).toNestedArray())
      return newAddress
    } catch {
      throw new Error('Erro ao criar endereço')
    }
  }
}

export const AddressService = new AddressServiceClass()
