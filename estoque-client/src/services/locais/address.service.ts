import type { Address, EnderecoApi } from '@/interfaces'

import { api } from '../api.config'

export interface AddressEnriched extends Address {
  municipio_nome?: string
  municipio_bairro?: string
  municipio_id?: number
  uf_sigla?: string
  uf_nome?: string
  uf_id?: number
}

function mapAddress (endereco: EnderecoApi): Address {
  return {
    id: endereco.id,
    logradouro: endereco.logradouro,
    numero: endereco.numero ?? '',
    complemento: endereco.complemento ?? null,
    id_municipio: endereco.municipio?.id ?? endereco.idMunicipio ?? 0,
  }
}

function mapAddressEnriched (endereco: EnderecoApi): AddressEnriched {
  return {
    ...mapAddress(endereco),
    municipio_nome: endereco.municipio?.nome,
    municipio_bairro: endereco.municipio?.bairro ?? undefined,
    municipio_id: endereco.municipio?.id,
    uf_sigla: endereco.municipio?.uf?.sigla,
    uf_nome: endereco.municipio?.uf?.nome,
    uf_id: endereco.municipio?.uf?.id,
  }
}

class AddressServiceClass {
  private endpoint = '/enderecos'

  async getAll (): Promise<Address[]> {
    const { data } = await api.get<EnderecoApi[]>(this.endpoint)
    return data.map(endereco => mapAddress(endereco))
  }

  async getAllEnriched (): Promise<AddressEnriched[]> {
    const { data } = await api.get<EnderecoApi[]>(this.endpoint)
    return data.map(endereco => mapAddressEnriched(endereco))
  }

  async getById (id: number): Promise<AddressEnriched> {
    const { data } = await api.get<EnderecoApi>(`${this.endpoint}/${id}`)
    return mapAddressEnriched(data)
  }

  async create (addressData: Omit<Address, 'id'>): Promise<AddressEnriched> {
    const payload = {
      logradouro: addressData.logradouro,
      numero: addressData.numero,
      complemento: addressData.complemento,
      id_municipio: addressData.id_municipio,
      ativo: true,
    }

    const { data } = await api.post<EnderecoApi>(this.endpoint, payload)
    return mapAddressEnriched(data)
  }

  async update (id: number, updates: Partial<Omit<Address, 'id'>>): Promise<AddressEnriched> {
    const payload = {
      logradouro: updates.logradouro,
      numero: updates.numero,
      complemento: updates.complemento,
      id_municipio: updates.id_municipio,
    }

    const { data } = await api.patch<EnderecoApi>(`${this.endpoint}/${id}`, payload)
    return mapAddressEnriched(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }
}

export const AddressService = new AddressServiceClass()
