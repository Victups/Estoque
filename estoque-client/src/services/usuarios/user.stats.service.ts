import { api } from '../api.config'
import { API_ROUTES } from '../api.routes'

export interface UserStats {
  totalUsers: number
  activeUsersCount: number
  inactiveUsersCount: number
  adminCount: number
}

class UserStatsServiceClass {
  async getStats (): Promise<UserStats> {
    const { data } = await api.get<UserStats>(API_ROUTES.usuarios.stats)
    return data
  }
}

export const UserStatsService = new UserStatsServiceClass()

