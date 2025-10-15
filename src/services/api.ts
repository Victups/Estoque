import type { BackendUser, Location, Product, ProductLote, State, StockMovement } from '@/types'

const API_URL = 'http://localhost:3001'

/**
 * Classe para lidar com respostas de arrays aninhados do json-server
 */
class ArrayResponse<T> {
  private data: T[]

  constructor (response: unknown) {
    if (Array.isArray(response) && Array.isArray(response[0])) {
      this.data = response[0]
    } else if (Array.isArray(response)) {
      this.data = response
    } else {
      this.data = []
    }
  }

  get (): T[] {
    return this.data
  }

  toNestedArray (): T[][] {
    return [this.data]
  }
}

/**
 * Serviço de API para usuários
 */
export const UserService = {
  /**
   * Busca todos os usuários
   */
  async getAll (): Promise<BackendUser[]> {
    const response = await fetch(`${API_URL}/usuarios`)
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<BackendUser>(data).get()
  },

  /**
   * Busca um usuário por ID
   */
  async getById (id: number): Promise<BackendUser | undefined> {
    const users = await this.getAll()
    return users.find((u: BackendUser) => u.id === id)
  },

  /**
   * Cria um novo usuário
   */
  async create (userData: Omit<BackendUser, 'id'>): Promise<BackendUser> {
    const users = await this.getAll()

    // Verificar se o email já existe
    const emailExists = users.some((u: BackendUser) => u.email === userData.email)
    if (emailExists) {
      throw new Error('Email já cadastrado')
    }

    // Gerar novo ID
    const newId: number = users.length > 0
      ? Math.max(...users.map((u: BackendUser) => u.id)) + 1
      : 1

    const newUser: BackendUser = {
      id: newId,
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      id_contato: userData.id_contato,
    }

    users.push(newUser)

    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new ArrayResponse(users).toNestedArray()),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar usuário')
    }

    return newUser
  },

  /**
   * Atualiza um usuário existente
   */
  async update (id: number, updates: Partial<Omit<BackendUser, 'id'>>): Promise<void> {
    const users = await this.getAll()
    const userIndex = users.findIndex((u: BackendUser) => u.id === id)

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    const existingUser = users[userIndex]
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    users[userIndex] = {
      id: existingUser.id,
      nome: updates.nome ?? existingUser.nome,
      email: updates.email ?? existingUser.email,
      senha: updates.senha ?? existingUser.senha,
      id_contato: updates.id_contato ?? existingUser.id_contato,
    }

    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new ArrayResponse(users).toNestedArray()),
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar usuário')
    }
  },

  /**
   * Deleta um usuário
   */
  async delete (id: number): Promise<void> {
    const users = await this.getAll()
    const updatedUsers = users.filter((u: BackendUser) => u.id !== id)

    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new ArrayResponse(updatedUsers).toNestedArray()),
    })

    if (!response.ok) {
      throw new Error('Erro ao excluir usuário')
    }
  },

  /**
   * Verifica se um email já existe
   */
  async emailExists (email: string, excludeId?: number): Promise<boolean> {
    const users = await this.getAll()
    return users.some((u: BackendUser) =>
      u.email === email && u.id !== excludeId,
    )
  },
}

/**
 * Serviço de API para movimentações de estoque
 */
export const MovementService = {
  /**
   * Busca todas as movimentações
   */
  async getAll (): Promise<StockMovement[]> {
    const response = await fetch(`${API_URL}/movimentacao_estoque`)
    if (!response.ok) {
      throw new Error('Erro ao buscar movimentações')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<StockMovement>(data).get()
  },

  /**
   * Cria uma nova movimentação
   */
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

    const response = await fetch(`${API_URL}/movimentacao_estoque`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new ArrayResponse(movements).toNestedArray()),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar movimentação')
    }

    return newMovement
  },
}

/**
 * Serviço de API para produtos
 */
export const ProductService = {
  /**
   * Busca todos os produtos
   */
  async getAll (): Promise<Product[]> {
    const response = await fetch(`${API_URL}/produtos`)
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<Product>(data).get()
  },

  /**
   * Busca produto por ID
   */
  async getById (id: number): Promise<Product | undefined> {
    const products = await this.getAll()
    return products.find((p: Product) => p.id === id)
  },
}

/**
 * Serviço de API para lotes
 */
export const LoteService = {
  /**
   * Busca todos os lotes
   */
  async getAll (): Promise<ProductLote[]> {
    const response = await fetch(`${API_URL}/produto_lotes`)
    if (!response.ok) {
      throw new Error('Erro ao buscar lotes')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<ProductLote>(data).get()
  },

  /**
   * Busca lotes por produto
   */
  async getByProduct (productId: number): Promise<ProductLote[]> {
    const lotes = await this.getAll()
    return lotes.filter((l: ProductLote) => l.id_produto === productId)
  },
}

/**
 * Serviço de API para localizações
 */
export const LocationService = {
  /**
   * Busca todas as localizações
   */
  async getAll (): Promise<Location[]> {
    const response = await fetch(`${API_URL}/localizacoes`)
    if (!response.ok) {
      throw new Error('Erro ao buscar localizações')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<Location>(data).get()
  },
}

/**
 * Serviço de API para UFs (Estados)
 */
export const UfService = {
  /**
   * Busca todas as UFs
   */
  async getAll (): Promise<State[]> {
    const response = await fetch(`${API_URL}/uf`)
    if (!response.ok) {
      throw new Error('Erro ao buscar UFs')
    }
    const data: unknown = await response.json()
    return new ArrayResponse<State>(data).get()
  },

  /**
   * Busca UF por ID
   */
  async getById (id: number): Promise<State | undefined> {
    const ufs = await this.getAll()
    return ufs.find((u: State) => u.id === id)
  },
}

/**
 * Serviço de autenticação
 */
export const AuthService = {
  /**
   * Realiza login verificando credenciais
   */
  async login (email: string, senha: string): Promise<BackendUser | null> {
    const users = await UserService.getAll()
    const user = users.find((u: BackendUser) =>
      u.email === email && u.senha === senha,
    )
    return user ?? null
  },
}

/**
 * Tratamento de erros da API
 */
export class ApiError extends Error {
  constructor (
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Helper para fazer requisições HTTP com tratamento de erro
 */
export async function fetchAPI<T> (
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options)

    if (!response.ok) {
      throw new ApiError(
        `Erro na requisição: ${response.statusText}`,
        response.status,
      )
    }

    return await response.json() as T
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Erro de conexão com o servidor')
  }
}
