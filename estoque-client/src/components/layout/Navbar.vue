<template>
  <v-app-bar class="norven-navbar" color="primary" elevation="0">
    <v-container class="navbar-container d-flex align-center pa-2 pa-md-3">
      <v-app-bar-nav-icon
        class="d-lg-none mobile-menu-btn"
        variant="text"
        @click.stop="drawer = !drawer"
      />
      <router-link class="text-decoration-none logo-link" to="/">
        <div class="d-flex align-center">
          <div class="logo-icon-wrapper">
            <v-icon class="logo-icon" size="28">mdi-package-variant</v-icon>
          </div>
          <v-app-bar-title class="text-subtitle-1 text-md-h6 font-weight-bold ml-2 ml-md-3">
            <span class="d-none d-sm-inline">Sistema de Estoque</span>
            <span class="d-sm-none">Estoque</span>
          </v-app-bar-title>
        </div>
      </router-link>
      <v-spacer />
      <div class="d-none d-lg-flex align-center ga-1 ga-md-2">
        <v-btn
          v-for="item in menuItems"
          :key="item.title"
          class="text-none nav-btn"
          :prepend-icon="item.icon"
          rounded="lg"
          size="small"
          :to="item.to"
          variant="text"
        >
          {{ item.title }}
        </v-btn>
      </div>
      <div class="d-none d-sm-flex align-center ml-2 ml-md-3 user-info ga-2">
        <div class="user-name d-none d-md-flex">
          <v-icon class="mr-1" icon="mdi-account" size="x-small" />
          <span class="text-caption text-md-body-2 font-weight-medium">{{ displayName || 'Usuário' }}</span>
        </div>
      </div>
      <v-menu offset-y transition="slide-y-transition">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-1 ml-md-2 profile-btn"
            icon
            size="small"
            variant="text"
          >
            <v-avatar color="white" size="32">
              <v-icon color="primary" size="20">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="profile-menu" elevation="8" rounded="lg">
          <v-list-item class="user-menu-header">
            <v-list-item-title class="font-weight-bold">{{ displayName || 'Usuário' }}</v-list-item-title>
          </v-list-item>
          <v-divider class="my-2" />
          <v-list-item
            class="menu-item"
            prepend-icon="mdi-account"
            title="Perfil"
            @click="goToProfile"
          />
          <v-list-item
            class="menu-item"
            prepend-icon="mdi-cog"
            title="Configurações"
            @click="goToSettings"
          />
          <v-divider class="my-2" />
          <v-list-item
            class="menu-item logout-item"
            prepend-icon="mdi-logout"
            title="Sair"
            @click="logout"
          />
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" class="mobile-drawer" temporary>
    <div class="drawer-header">
      <div class="d-flex align-center pa-4">
        <div class="logo-icon-wrapper-drawer">
          <v-icon color="primary" size="28">mdi-package-variant</v-icon>
        </div>
        <div class="ml-3">
          <div class="text-h6 font-weight-bold">Sistema de Estoque</div>
          <div class="text-caption text-medium-emphasis">Gerenciamento</div>
        </div>
      </div>
    </div>

    <v-divider />

    <div class="pa-3">
      <v-list density="compact" nav rounded="lg">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          class="drawer-item mb-1"
          :prepend-icon="item.icon"
          rounded="lg"
          :title="item.title"
          :to="item.to"
        />
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { AuthService } from '@/services/auth.service'
  import { useAuthStore } from '@/stores/auth'

  export default defineComponent({
    name: 'NavbarComponent',
    data () {
      return {
        drawer: false,
        menuItems: [
          {
            title: 'Home',
            icon: 'mdi-home',
            to: '/',
          },
          {
            title: 'Produtos',
            icon: 'mdi-package-variant',
            to: '/produtos',
          },
          {
            title: 'Movimentação',
            icon: 'mdi-swap-horizontal',
            to: '/movimentacao',
          },
          {
            title: 'Usuários',
            icon: 'mdi-account-group',
            to: '/usuarios',
          },
          // Item de menu de relatórios ocultado temporariamente
          // {
          //   title: 'Relatórios',
          //   icon: 'mdi-chart-line',
          //   to: '/relatorios',
          // },
        ],
      }
    },
    computed: {
      auth () {
        return useAuthStore()
      },
      displayName () {
        return this.auth.displayName
      },
    },
    methods: {
      goToProfile () {
        this.$router.push('/perfil')
      },
      goToSettings () {
        this.$router.push('/configuracoes')
      },
      logout () {
        this.auth.logout()
        AuthService.logout()
        this.$router.push('/login')
      },
    },
  })
</script>

<style scoped>
/* Melhorado o gradiente e adicionado backdrop blur para efeito glassmorphism */
.norven-navbar {
  background: #7B2CBF  !important;
  box-shadow: 0 4px 20px rgba(123, 44, 191, 0.25);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Container responsivo com max-width */
.navbar-container {
  max-width: 100%;
  width: 100%;
}

@media (min-width: 1440px) {
  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.norven-navbar.dark {
  background: linear-gradient(135deg, #4A148C 0%, #6A1B9A 50%, #7B2CBF 100%) !important;
  box-shadow: 0 4px 20px rgba(74, 20, 140, 0.4);
}

/* Adicionado wrapper para o ícone do logo com animação */
.logo-link {
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: translateY(-2px);
}

.logo-icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 36px;
  min-height: 36px;
}

.logo-link:hover .logo-icon-wrapper {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(5deg);
}

.logo-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.v-app-bar-title {
  color: white;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Melhorados os botões de navegação com hover states mais sofisticados */
.nav-btn {
  color: white !important;
  font-weight: 500;
  letter-spacing: 0.2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.nav-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-2px);
}

.nav-btn:hover::before {
  width: 80%;
}

.nav-btn.v-btn--active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.nav-btn.v-btn--active::before {
  width: 80%;
}

/* Adicionados badges estilizados para localização e usuário */
.user-info {
  color: white;
  flex-shrink: 0;
}

.user-name {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1280px) {
  .user-name {
    max-width: 120px;
    padding: 4px 8px;
  }
}

.user-name:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Melhorado o botão mobile com animação */
.mobile-menu-btn {
  color: white !important;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: rotate(90deg);
}

/* Melhorado o drawer mobile com design mais moderno */
.mobile-drawer {
  border-right: none !important;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  background: linear-gradient(135deg, rgba(123, 44, 191, 0.05) 0%, rgba(156, 78, 214, 0.05) 100%);
}

.logo-icon-wrapper-drawer {
  background: linear-gradient(135deg, #7B2CBF 0%, #9C4ED6 100%);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(123, 44, 191, 0.3);
}

.drawer-item {
  transition: all 0.2s ease;
}

.drawer-item:hover {
  background-color: rgba(123, 44, 191, 0.08) !important;
  transform: translateX(4px);
}

.drawer-item.v-list-item--active {
  background: linear-gradient(90deg, rgba(123, 44, 191, 0.15) 0%, rgba(123, 44, 191, 0.05) 100%) !important;
  color: #7B2CBF;
  font-weight: 600;
  border-left: 3px solid #7B2CBF;
}

.drawer-item.v-list-item--active .v-icon {
  color: #7B2CBF;
}

/* Estilo específico para o item de configurações no menu do perfil */
.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(123, 44, 191, 0.08) !important;
  transform: translateX(4px);
}

.menu-item.logout-item:hover {
  background-color: rgba(244, 67, 54, 0.08) !important;
  color: #f44336;
}

/* Adicionadas animações suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.norven-navbar {
  animation: fadeIn 0.5s ease;
}

a {
  color: inherit;
}
</style>
