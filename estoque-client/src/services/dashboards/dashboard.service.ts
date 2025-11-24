import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

export interface DashboardStats {
  totalProducts: number
  totalStock: number
  totalValue: number
  productsNearExpiration: number
  lowStockProducts: number
}

class DashboardServiceClass {
  async getStats (): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>(API_ROUTES.dashboards.stats)
    return data
  }
}

export const DashboardService = new DashboardServiceClass()

