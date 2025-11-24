/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import { useUnauthorizedStore } from '@/stores/unauthorized'

const route = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: {
      layout: 'blank',
      public: true,
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/produtos/cadastrar',
    name: 'CadastroProdutos',
    component: () => import('@/pages/produtos/CadastroProdutos.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/produtos/:id/editar',
    name: 'EditarProduto',
    component: () => import('@/pages/produtos/CadastroProdutos.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/movimentacao',
    name: 'Movimentacao',
    component: () => import('@/pages/estoques/Movimentacao.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  // Rota de relatórios ocultada temporariamente
  // {
  //   path: '/relatorios',
  //   name: 'Relatorios',
  //   component: () => import('@/pages/dashboards/Relatorios.vue'),
  //   meta: {
  //     layout: 'default',
  //     requiresAuth: true,
  //   },
  // },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/pages/usuarios/Profile.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/usuarios',
    name: 'UserManagement',
    component: () => import('@/pages/usuarios/UserManagementPage.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
    },
  },
  {
    path: '/configuracoes',
    name: 'Configuracoes',
    component: () => import('@/pages/configuracoes/Configuracoes.vue'),
    meta: {
      layout: 'default',
      requiresAuth: true,
      requiredRole: ['admin'],
    },
  },
  {
    path: '/registrar',
    name: 'Registrer',
    component: () => import('@/pages/auth/Registrer.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: true,
      requiredRole: ['admin'],
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(route),
})

// Navigation guard para verificar autenticação e roles
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    authStore.loadFromStorage()
  }

  const isPublicRoute = Boolean((to.meta as any)?.public)
  const isAuthenticated = AuthService.isAuthenticated()

  if (!isAuthenticated && !isPublicRoute) {
    if (to.path !== '/login') {
      window.alert('Sua sessão expirou ou você não está autenticado. Faça login para continuar.')
    }
    authStore.logout()
    const redirectQuery = to.fullPath && to.fullPath !== '/login' ? { redirect: to.fullPath } : null
    next(
      redirectQuery
        ? { path: '/login', query: redirectQuery }
        : { path: '/login' },
    )
    return
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/')
    return
  }

  if (to.meta.requiresAuth) {
    const requiredRoleMeta = (to.meta as any)?.requiredRole
    if (requiredRoleMeta) {
      const userRole = authStore.role?.toLowerCase()
      const requiredRoles = Array.isArray(requiredRoleMeta)
        ? requiredRoleMeta.map((r: string) => r.toLowerCase())
        : [String(requiredRoleMeta).toLowerCase()]

      if (!userRole || !requiredRoles.includes(userRole)) {
        const unauthorizedStore = useUnauthorizedStore()
        unauthorizedStore.show('Você não tem permissão para acessar esta página. Apenas administradores podem acessar esta funcionalidade.')
        const fallback = from?.fullPath && from.fullPath !== to.fullPath ? from.fullPath : '/'
        next(fallback)
        return
      }
    }
  }

  next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
