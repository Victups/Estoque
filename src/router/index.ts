/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router'

const route = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: {
      layout: 'blank',
    },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/pages/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: () => import('@/pages/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/produtos/cadastrar',
    name: 'CadastroProdutos',
    component: () => import('@/pages/CadastroProdutos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: () => import('@/pages/Produtos.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/movimentacao',
    name: 'Movimentacao',
    component: () => import('@/pages/Movimentacao.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('@/pages/Relatorios.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/pages/Profile.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/usuarios',
    name: 'UserManagement',
    component: () => import('@/pages/UserManagementPage.vue'),
    meta: {
      layout: 'default',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(route),
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
