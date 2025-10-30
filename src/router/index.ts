/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: {
      layout: 'blank',
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/produtos/cadastrar',
    name: 'CadastroProdutos',
    component: () => import('@/pages/produtos/CadastroProdutos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: () => import('@/pages/produtos/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/movimentacao',
    name: 'Movimentacao',
    component: () => import('@/pages/estoques/Movimentacao.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('@/pages/dashboards/Relatorios.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/pages/usuarios/Profile.vue'),
    meta: {
      layout: 'default',
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

  // Verificar se a rota requer autenticação
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // Redirecionar para login se não estiver autenticado
      next('/login')
      return
    }

    // Verificar role se especificado
    const requiredRoleMeta = (to.meta as any)?.requiredRole
    if (requiredRoleMeta) {
      const userRole = authStore.role?.toLowerCase()
      const requiredRoles = Array.isArray(requiredRoleMeta)
        ? requiredRoleMeta.map((r: string) => r.toLowerCase())
        : [String(requiredRoleMeta).toLowerCase()]

      if (!userRole || !requiredRoles.includes(userRole)) {
        // Redirecionar para home se não tiver permissão
        next('/')
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
