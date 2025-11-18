import axios from 'axios'

import { getApiBaseUrl } from '@/utils/env'
import { clearSession, getStoredToken } from './auth.storage'

/**
 * Configuração base do Axios
 */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Interceptor de requisição
 */
api.interceptors.request.use(
  config => {
    const token = getStoredToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

/**
 * Interceptor de resposta
 */
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // Tratamento global de erros
    if (error.response) {
      // Erro com resposta do servidor
      console.error('Erro na resposta:', error.response.status)
      if (error.response.status === 401) {
        clearSession()
      }
    } else if (error.request) {
      // Erro sem resposta do servidor
      console.error('Erro de rede:', error.request)
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message)
    }
    return Promise.reject(error)
  },
)

/**
 * Classe para lidar com respostas de arrays aninhados do json-server
 */
export class ArrayResponse<T> {
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
 * Classe para erros personalizados da API
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
