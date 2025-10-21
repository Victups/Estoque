import type { Contact, Supplier } from '@/types'

import { api, ArrayResponse } from './api.config'

/**
 * Interface para fornecedor enriquecido
 */
export interface SupplierEnriched extends Supplier {
  contato_nome?: string
  contato_valor?: string
  contato_tipo?: string
}

/**
 * Serviço de API para Fornecedores
 */
class SupplierServiceClass {
  private endpoint = '/fornecedores'

  async getAll (): Promise<Supplier[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Supplier>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar fornecedores')
    }
  }

  /**
   * Busca fornecedores ENRIQUECIDOS com dados de contato
   */
  async getAllEnriched (): Promise<SupplierEnriched[]> {
    try {
      const [suppliers, contacts] = await Promise.all([
        this.getAll(),
        ContactService.getAll(),
      ])

      const contactMap = new Map(contacts.map(c => [c.id, c]))

      return suppliers.map(supplier => {
        const contato = contactMap.get(supplier.id_contato)

        return {
          ...supplier,
          contato_nome: contato?.nome,
          contato_valor: contato?.valor,
          contato_tipo: contato?.tipo_contato,
        }
      })
    } catch {
      throw new Error('Erro ao buscar fornecedores enriquecidos')
    }
  }

  async getById (id: number): Promise<Supplier | undefined> {
    const suppliers = await this.getAll()
    return suppliers.find((s: Supplier) => s.id === id)
  }

  async create (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
    const suppliers = await this.getAll()

    const newId: number = suppliers.length > 0
      ? Math.max(...suppliers.map((s: Supplier) => s.id)) + 1
      : 1

    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
    }

    suppliers.push(newSupplier)

    try {
      await api.put(this.endpoint, new ArrayResponse(suppliers).toNestedArray())
      return newSupplier
    } catch {
      throw new Error('Erro ao criar fornecedor')
    }
  }

  async update (id: number, updates: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
    const suppliers = await this.getAll()
    const supplierIndex = suppliers.findIndex((s: Supplier) => s.id === id)

    if (supplierIndex === -1) {
      throw new Error('Fornecedor não encontrado')
    }

    const existing = suppliers[supplierIndex]
    if (!existing) {
      throw new Error('Fornecedor não encontrado')
    }

    const updated: Supplier = {
      ...existing,
      ...updates,
      id: existing.id,
    }

    suppliers[supplierIndex] = updated

    try {
      await api.put(this.endpoint, new ArrayResponse(suppliers).toNestedArray())
      return updated
    } catch {
      throw new Error('Erro ao atualizar fornecedor')
    }
  }

  async delete (id: number): Promise<void> {
    const suppliers = await this.getAll()
    const updated = suppliers.filter((s: Supplier) => s.id !== id)

    try {
      await api.put(this.endpoint, new ArrayResponse(updated).toNestedArray())
    } catch {
      throw new Error('Erro ao excluir fornecedor')
    }
  }
}

/**
 * Serviço de API para Contatos
 */
class ContactServiceClass {
  private endpoint = '/contatos'

  async getAll (): Promise<Contact[]> {
    try {
      const response = await api.get(this.endpoint)
      return new ArrayResponse<Contact>(response.data).get()
    } catch {
      throw new Error('Erro ao buscar contatos')
    }
  }

  async getById (id: number): Promise<Contact | undefined> {
    const contacts = await this.getAll()
    return contacts.find((c: Contact) => c.id === id)
  }

  async create (contactData: Omit<Contact, 'id' | 'data_criacao'>): Promise<Contact> {
    const contacts = await this.getAll()

    const newId: number = contacts.length > 0
      ? Math.max(...contacts.map((c: Contact) => c.id)) + 1
      : 1

    const newContact: Contact = {
      ...contactData,
      id: newId,
      data_criacao: new Date().toISOString(),
    }

    contacts.push(newContact)

    try {
      await api.put(this.endpoint, new ArrayResponse(contacts).toNestedArray())
      return newContact
    } catch {
      throw new Error('Erro ao criar contato')
    }
  }
}

export const SupplierService = new SupplierServiceClass()
export const ContactService = new ContactServiceClass()
