import type { Municipality, MunicipioApi, State, UfApi } from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'


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
  }
}

class UfServiceClass {
  async getAll (): Promise<State[]> {
    const { data } = await api.get<UfApi[]>(API_ROUTES.uf.base)
    return data.map(uf => mapUf(uf))
  }

  async getById (id: number): Promise<State> {
    const { data } = await api.get<UfApi>(`${API_ROUTES.uf.base}/${id}`)
    return mapUf(data)
  }
}

class MunicipalityServiceClass {
  async getAll (): Promise<Municipality[]> {
    const { data } = await api.get<MunicipioApi[]>(API_ROUTES.municipios.base)
    return data.map(municipio => mapMunicipio(municipio))
  }

  async getById (id: number): Promise<Municipality> {
    const { data } = await api.get<MunicipioApi>(`${API_ROUTES.municipios.base}/${id}`)
    return mapMunicipio(data)
  }

  async getByUf (ufId: number): Promise<Municipality[]> {
    const { data } = await api.get<MunicipioApi[]>(API_ROUTES.municipios.byUf(ufId))
    return data.map(municipio => mapMunicipio(municipio))
  }
}

export const UfService = new UfServiceClass()
export const MunicipalityService = new MunicipalityServiceClass()
