import type { Municipality, State } from '@/types'

import { api, ArrayResponse } from './api.config'

/**
 * Serviço de API para UFs (Estados)
 */
class UfServiceClass {
  private endpoint = '/uf'

  async getAll (): Promise<State[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<State>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar UFs')
    }
  }

  async getById (id: number): Promise<State | undefined> {
    const ufs = await this.getAll()
    return ufs.find((u: State) => u.id === id)
  }
}

/**
 * Serviço de API para Municípios (db.json: municipio)
 */
class MunicipalityServiceClass {
  private endpoint = '/municipio'

  async getAll (): Promise<Municipality[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Municipality>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar municípios')
    }
  }

  async getById (id: number): Promise<Municipality | undefined> {
    const municipalities = await this.getAll()
    return municipalities.find((m: Municipality) => m.id === id)
  }

  async getByUf (ufId: number): Promise<Municipality[]> {
    const municipalities = await this.getAll()
    return municipalities.filter((m: Municipality) => m.id_uf === ufId)
  }
}

export const UfService = new UfServiceClass()
export const MunicipalityService = new MunicipalityServiceClass()
