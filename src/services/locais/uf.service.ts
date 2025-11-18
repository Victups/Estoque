import type { Municipality, MunicipioApi, State, UfApi } from '@/interfaces'

import { api } from '../api.config'

function mapUf (uf: UfApi): State {
  return {
    id: uf.id,
    sigla: uf.sigla,
    nome: uf.nome,
  }
}

function mapMunicipio (municipio: MunicipioApi): Municipality {
  return {
    id: municipio.id,
    nome: municipio.nome,
    id_uf: municipio.idUf ?? municipio.uf?.id ?? 0,
    bairro: municipio.bairro ?? '',
  }
}

class UfServiceClass {
  private endpoint = '/uf'

  async getAll (): Promise<State[]> {
    const { data } = await api.get<UfApi[]>(this.endpoint)
    return data.map(uf => mapUf(uf))
  }

  async getById (id: number): Promise<State> {
    const { data } = await api.get<UfApi>(`${this.endpoint}/${id}`)
    return mapUf(data)
  }
}

class MunicipalityServiceClass {
  private endpoint = '/municipios'

  async getAll (): Promise<Municipality[]> {
    const { data } = await api.get<MunicipioApi[]>(this.endpoint)
    return data.map(municipio => mapMunicipio(municipio))
  }

  async getById (id: number): Promise<Municipality> {
    const { data } = await api.get<MunicipioApi>(`${this.endpoint}/${id}`)
    return mapMunicipio(data)
  }

  async getByUf (ufId: number): Promise<Municipality[]> {
    const { data } = await api.get<MunicipioApi[]>(`${this.endpoint}/uf/${ufId}`)
    return data.map(municipio => mapMunicipio(municipio))
  }
}

export const UfService = new UfServiceClass()
export const MunicipalityService = new MunicipalityServiceClass()
