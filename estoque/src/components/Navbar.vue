<template>
  <v-app-bar class="norven-navbar" color="primary" elevation="2">
    <v-container class="d-flex align-center px-4">
      <v-app-bar-nav-icon
        class="d-lg-none"
        variant="text"
        @click.stop="drawer = !drawer"
      />
      <router-link class="text-decoration-none" to="/">
        <div class="d-flex align-center">
          <v-icon class="mr-2" size="32">mdi-package-variant</v-icon>
          <v-app-bar-title class="text-h6 font-weight-bold">
            Sistema de Estoque
          </v-app-bar-title>
        </div>
      </router-link>
      <v-spacer />
      <div class="d-none d-lg-flex align-center ga-2">
        <v-btn
          v-for="item in menuItems"
          :key="item.title"
          class="text-none"
          :prepend-icon="item.icon"
          :to="item.to"
          variant="text"
        >
          {{ item.title }}
        </v-btn>
      </div>
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-2"
            icon="mdi-account-circle"
          />
        </template>
        <v-list>
          <v-list-item
            prepend-icon="mdi-account"
            title="Perfil"
            @click="goToProfile"
          />
          <v-list-item
            prepend-icon="mdi-cog"
            title="Configurações"
            @click="goToSettings"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sair"
            @click="logout"
          />
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item
        prepend-icon="mdi-package-variant"
        subtitle="Gerenciamento"
        title="Sistema de Estoque"
      />
    </v-list>

    <v-divider />
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const drawer = ref(false)

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard',
      to: '/',
    },
    {
      title: 'Produtos',
      icon: 'mdi-package-variant',
      to: '/produtos',
    },
    {
      title: 'Estoque',
      icon: 'mdi-warehouse',
      to: '/estoque',
    },
    {
      title: 'Relatórios',
      icon: 'mdi-chart-line',
      to: '/relatorios',
    },
  ]

  function goToProfile () {
    router.push('/perfil')
  }

  function goToSettings () {
    router.push('/configuracoes')
  }

  function logout () {
    // Lógica de logout aqui
    console.log('Logout realizado')
    router.push('/login')
  }
</script>

<style scoped>
.norven-navbar {
  background: linear-gradient(135deg, #7B2CBF 0%, #9C4ED6 100%) !important;
  box-shadow: 0 2px 8px rgba(123, 44, 191, 0.3);
  transition: all 0.3s ease;
}

.norven-navbar.dark {
  background: linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%) !important;
  box-shadow: 0 2px 8px rgba(74, 20, 140, 0.4);
}

.v-app-bar-title {
  color: white;
  font-weight: 600;
}

.v-btn {
  color: white;
}

.v-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

a {
  color: inherit;
}

.v-navigation-drawer {
  border-right: 3px solid #7B2CBF;
  transition: border-color 0.3s ease;
}

.v-navigation-drawer.dark {
  border-right-color: #B39DDB;
}

.v-list-item--active {
  background-color: rgba(123, 44, 191, 0.1);
  color: #7B2CBF;
}

.v-list-item--active .v-icon {
  color: #7B2CBF;
}

.v-list-item--active.dark {
  background-color: rgba(179, 157, 219, 0.1);
  color: #B39DDB;
}

.v-list-item--active.dark .v-icon {
  color: #B39DDB;
}
</style>
