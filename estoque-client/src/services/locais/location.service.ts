import type { Deposit, DepositoApi, EnderecoApi, LocalizacaoApi, Location } from '@/interfaces'

import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

/**
 * Interface para localização COMPLETA (com toda hierarquia)
 */
export interface LocationComplete extends Location {
  // Depósito
  deposito_nome?: string
  deposito_id?: number

  // Endereço
  endereco_completo?: string
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
function mapLocation (loc: LocalizacaoApi): Location {
  return {
    id: loc.id,
    id_deposito: loc.deposito?.id ?? 0,
    corredor: loc.corredor ?? '',
    prateleira: loc.prateleira ?? '',
    secao: loc.secao ?? '',
  }
}

function buildEnderecoCompleto (endereco?: EnderecoApi | null): string | undefined {
  if (!endereco) {
    return undefined
  }
  const partes = [endereco.logradouro, endereco.numero, endereco.complemento].filter(Boolean)
  return partes.length > 0 ? partes.join(', ') : undefined
}

class LocationServiceClass {
  async getAll (): Promise<Location[]> {
    const localizacoes = await this.fetchAll()
    return localizacoes.map(loc => mapLocation(loc))
  }

  /**
   * Busca localização COMPLETA com toda hierarquia até UF (quando disponível)
   * @param ufId - ID da UF para filtrar (opcional)
   */
  async getAllComplete (ufId?: number | null): Promise<LocationComplete[]> {
    const localizacoes = await this.fetchAll()

    const filtradas = ufId
      ? localizacoes.filter(loc => loc.deposito?.endereco?.municipio?.uf?.id === ufId)
      : localizacoes

    return filtradas.map(loc => {
      const base = mapLocation(loc)
      const endereco = loc.deposito?.endereco
      const localizacaoCompleta = [
        loc.deposito?.nome,
        loc.corredor,
        loc.prateleira,
        loc.secao,
      ].filter(Boolean).join(' - ')

      return {
        ...base,
        deposito_nome: loc.deposito?.nome,
        deposito_id: loc.deposito?.id,
        endereco_completo: buildEnderecoCompleto(endereco),
        endereco_id: endereco?.id,
        municipio_nome: endereco?.municipio?.nome,
        municipio_bairro: endereco?.municipio?.bairro ?? undefined,
        municipio_id: endereco?.municipio?.id,
        uf_sigla: endereco?.municipio?.uf?.sigla,
        uf_nome: endereco?.municipio?.uf?.nome,
        uf_id: endereco?.municipio?.uf?.id,
        localizacao_completa: localizacaoCompleta || undefined,
      }
    })
  }

  async getById (id: number): Promise<Location> {
    const { data } = await api.get<LocalizacaoApi>(API_ROUTES.locais.byId(id))
    return mapLocation(data)
  }

  async getByDeposit (depositId: number): Promise<Location[]> {
    const localizacoes = await this.getAll()
    return localizacoes.filter(loc => loc.id_deposito === depositId)
  }

  async create (locationData: Omit<Location, 'id'>): Promise<Location> {
    const payload = {
      corredor: locationData.corredor,
      prateleira: locationData.prateleira,
      secao: locationData.secao,
      id_deposito: locationData.id_deposito,
      ativo: true,
    }

    const { data } = await api.post<LocalizacaoApi>(API_ROUTES.locais.base, payload)
    return mapLocation(data)
  }

  async update (id: number, updates: Partial<Omit<Location, 'id'>>): Promise<Location> {
    const payload = {
      corredor: updates.corredor,
      prateleira: updates.prateleira,
      secao: updates.secao,
      id_deposito: updates.id_deposito,
    }

    const { data } = await api.patch<LocalizacaoApi>(API_ROUTES.locais.byId(id), payload)
    return mapLocation(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.locais.byId(id))
  }

  private async fetchAll (): Promise<LocalizacaoApi[]> {
    const { data } = await api.get<LocalizacaoApi[]>(API_ROUTES.locais.base)
    return data
  }
}

/**
 * Interface para depósito enriquecido
 */
export interface DepositEnriched extends Deposit {
  endereco_completo?: string
  municipio_nome?: string
  municipio_bairro?: string
  uf_sigla?: string
  uf_nome?: string
}

/**
 * Serviço de API para Depósitos
 */
class DepositServiceClass {
  async getAll (): Promise<Deposit[]> {
    const depositos = await this.fetchAll()
    return depositos.map(deposito => ({
      id: deposito.id,
      nome: deposito.nome,
      id_endereco: deposito.endereco?.id ?? 0,
    }))
  }

  async getAllEnriched (): Promise<DepositEnriched[]> {
    const depositos = await this.fetchAll()
    return depositos.map(deposito => ({
      id: deposito.id,
      nome: deposito.nome,
      id_endereco: deposito.endereco?.id ?? 0,
      endereco_completo: buildEnderecoCompleto(deposito.endereco),
      municipio_nome: deposito.endereco?.municipio?.nome,
      municipio_bairro: deposito.endereco?.municipio?.bairro ?? undefined,
      uf_sigla: deposito.endereco?.municipio?.uf?.sigla,
      uf_nome: deposito.endereco?.municipio?.uf?.nome,
    }))
  }

  async getById (id: number): Promise<Deposit> {
    const { data } = await api.get<DepositoApi>(API_ROUTES.depositos.byId(id))
    return {
      id: data.id,
      nome: data.nome,
      id_endereco: data.endereco?.id ?? 0,
    }
  }

  async create (depositData: Omit<Deposit, 'id'>): Promise<Deposit> {
    const { data } = await api.post<DepositoApi>(API_ROUTES.depositos.base, {
      nome: depositData.nome,
      id_endereco: depositData.id_endereco,
      ativo: true,
    })

    return {
      id: data.id,
      nome: data.nome,
      id_endereco: data.endereco?.id ?? depositData.id_endereco,
    }
  }

  async update (id: number, updates: Partial<Omit<Deposit, 'id'>>): Promise<Deposit> {
    const { data } = await api.patch<DepositoApi>(API_ROUTES.depositos.byId(id), {
      nome: updates.nome,
      id_endereco: updates.id_endereco,
    })

    return {
      id: data.id,
      nome: data.nome,
      id_endereco: data.endereco?.id ?? updates.id_endereco ?? 0,
    }
  }

  async delete (id: number): Promise<void> {
    await api.delete(API_ROUTES.depositos.byId(id))
  }

  private async fetchAll (): Promise<DepositoApi[]> {
    const { data } = await api.get<DepositoApi[]>(API_ROUTES.depositos.base)
    return data
  }
}

export const LocationService = new LocationServiceClass()
export const DepositService = new DepositServiceClass()
