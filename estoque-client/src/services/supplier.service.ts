import type { Contact, ContatoApi, FornecedorApi, Supplier } from '@/interfaces'

import { api } from './api.config'

function mapContact (contato: ContatoApi): Contact {
  return {
  id: contato.id,
  nome: contato.nome,
  valor: contato.valor ?? '',
  tipo_contato: contato.tipo_contato ?? 'outro',
  codigo_pais: contato.codigo_pais ?? null,
  data_criacao: contato.dataCriacao ?? new Date().toISOString(),
  }
}

function mapSupplier (fornecedor: FornecedorApi): Supplier {
  return {
  id: fornecedor.id,
  nome: fornecedor.nome,
  cnpj: fornecedor.cnpj ?? null,
  id_contato: fornecedor.contato?.id ?? null,
  contato: fornecedor.contato ? mapContact(fornecedor.contato) : undefined,
  }
}

/**
 * Interface para fornecedor enriquecido
 */
export interface SupplierEnriched extends Supplier {
  contato_nome?: string
  contato_valor?: string
  contato_tipo?: string
}

function cleanPayload<T extends Record<string, unknown>> (payload: T): T {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  return Object.fromEntries(entries) as T
}

type CreateFornecedorPayload = {
  nome: string
  cnpj?: string
  id_contato?: number
  ativo?: boolean
}

/**
 * Serviço de API para Fornecedores
 */
class SupplierServiceClass {
  private endpoint = '/fornecedores'

  async getAll (): Promise<Supplier[]> {
    const fornecedores = await this.fetchAll()
    return fornecedores.map(fornecedor => mapSupplier(fornecedor))
  }

  async getAllEnriched (): Promise<SupplierEnriched[]> {
    const fornecedores = await this.fetchAll()
    return fornecedores.map(fornecedor => {
      const base = mapSupplier(fornecedor)
      return {
        ...base,
        contato_nome: fornecedor.contato?.nome,
        contato_valor: fornecedor.contato?.valor ?? undefined,
        contato_tipo: fornecedor.contato?.tipo_contato,
      }
    })
  }

  async getById (id: number): Promise<Supplier> {
    const { data } = await api.get<FornecedorApi>(`${this.endpoint}/${id}`)
    return mapSupplier(data)
  }

  async create (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
    const payload: CreateFornecedorPayload = cleanPayload({
      nome: supplierData.nome,
      cnpj: supplierData.cnpj ?? undefined,
      id_contato: supplierData.id_contato ?? undefined,
      ativo: true,
    })

    const { data } = await api.post<FornecedorApi>(this.endpoint, payload)
    return mapSupplier(data)
  }

  async update (id: number, updates: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
    const payload = cleanPayload({
      nome: updates.nome,
      cnpj: updates.cnpj,
      id_contato: updates.id_contato,
    })

    const { data } = await api.patch<FornecedorApi>(`${this.endpoint}/${id}`, payload)
    return mapSupplier(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }

  private async fetchAll (): Promise<FornecedorApi[]> {
    const { data } = await api.get<FornecedorApi[]>(this.endpoint)
    return data
  }
}

class ContactServiceClass {
  private endpoint = '/contatos'

  async getAll (): Promise<Contact[]> {
    const contatos = await this.fetchAll()
    return contatos.map(contato => mapContact(contato))
  }

  async getById (id: number): Promise<Contact> {
    const { data } = await api.get<ContatoApi>(`${this.endpoint}/${id}`)
    return mapContact(data)
  }

  async create (contactData: Omit<Contact, 'id' | 'data_criacao'>): Promise<Contact> {
    const payload = cleanPayload({
      nome: contactData.nome,
      valor: contactData.valor,
      tipo_contato: contactData.tipo_contato,
      codigo_pais: contactData.codigo_pais,
      ativo: true,
    })

    const { data } = await api.post<ContatoApi>(this.endpoint, payload)
    return mapContact(data)
  }

  async update (id: number, contactData: Partial<Omit<Contact, 'id' | 'data_criacao'>>): Promise<Contact> {
    const payload = cleanPayload({
      nome: contactData.nome,
      valor: contactData.valor,
      tipo_contato: contactData.tipo_contato,
      codigo_pais: contactData.codigo_pais,
    })

    const { data } = await api.patch<ContatoApi>(`${this.endpoint}/${id}`, payload)
    return mapContact(data)
  }

  async delete (id: number): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }

  private async fetchAll (): Promise<ContatoApi[]> {
    const { data } = await api.get<ContatoApi[]>(this.endpoint)
    return data
  }
}

export const SupplierService = new SupplierServiceClass()
export const ContactService = new ContactServiceClass()
