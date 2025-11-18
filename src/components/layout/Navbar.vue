<template>
  <v-app-bar class="norven-navbar" color="primary" elevation="0">
    <v-container class="d-flex align-center px-4">
      <v-app-bar-nav-icon
        class="d-lg-none mobile-menu-btn"
        variant="text"
        @click.stop="drawer = !drawer"
      />
      <router-link class="text-decoration-none logo-link" to="/">
        <div class="d-flex align-center">
          <div class="logo-icon-wrapper">
            <v-icon class="logo-icon" size="32">mdi-package-variant</v-icon>
          </div>
          <v-app-bar-title class="text-h6 font-weight-bold ml-3">
            Sistema de Estoque
          </v-app-bar-title>
        </div>
      </router-link>
      <v-spacer />
      <div class="d-none d-lg-flex align-center ga-3">
        <v-btn
          v-for="item in menuItems"
          :key="item.title"
          class="text-none nav-btn"
          :prepend-icon="item.icon"
          rounded="lg"
          :to="item.to"
          variant="text"
        >
          {{ item.title }}
        </v-btn>
      </div>
      <div class="d-none d-sm-flex align-center ml-4 mr-2 user-info">
        <!-- Adicionado cursor pointer e click handler no badge de localização -->
        <div class="location-badge clickable" @click="ufDialog = true">
          <v-icon class="mr-1" icon="mdi-map-marker" size="small" />
          <span>{{ ufText }}</span>
          <v-icon class="ml-1" icon="mdi-chevron-down" size="small" />
        </div>

        <div class="user-name ml-3">
          <v-icon class="mr-1" icon="mdi-account" size="small" />
          <span class="font-weight-medium">{{ displayName || 'Usuário' }}</span>
        </div>
      </div>
      <v-menu offset-y transition="slide-y-transition">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="ml-3 profile-btn"
            icon
            size="large"
          >
            <v-avatar color="white" size="40">
              <v-icon color="primary" size="24">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="profile-menu" elevation="8" rounded="lg">
          <v-list-item class="user-menu-header">
            <v-list-item-title class="font-weight-bold">{{ displayName || 'Usuário' }}</v-list-item-title>
            <v-list-item-subtitle>{{ ufText }}</v-list-item-subtitle>
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

  <!-- Adicionado dialog para seleção de UF -->
  <v-dialog v-model="ufDialog" max-width="600" scrollable>
    <v-card class="uf-dialog" rounded="xl">
      <v-card-title class="uf-dialog-header">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary" size="28">mdi-map-marker</v-icon>
            <span class="text-h6 font-weight-bold">Selecione seu Estado</span>
          </div>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="ufDialog = false"
          />
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-text-field
          v-model="ufSearch"
          class="mb-4"
          clearable
          density="comfortable"
          hide-details
          placeholder="Buscar estado..."
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          variant="outlined"
        />

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular color="primary" indeterminate size="48" />
          <p class="text-body-2 mt-4 text-medium-emphasis">Carregando estados...</p>
        </div>

        <div v-else-if="filteredUFs.length === 0" class="text-center py-8">
          <v-icon color="grey" size="48">mdi-map-marker-off</v-icon>
          <p class="text-body-2 mt-4 text-medium-emphasis">Nenhum estado encontrado</p>
        </div>

        <div v-else class="uf-grid">
          <v-card
            v-for="uf in filteredUFs"
            :key="uf.id"
            class="uf-card"
            :class="{ 'uf-card-selected': selectedUfId === uf.id }"
            elevation="0"
            rounded="lg"
            @click="selectUF(uf.id)"
          >
            <div class="uf-card-content">
              <div class="uf-sigla">{{ uf.sigla }}</div>
              <div class="uf-nome">{{ uf.nome }}</div>
              <v-icon
                v-if="selectedUfId === uf.id"
                class="uf-check"
                color="primary"
                size="20"
              >
                mdi-check-circle
              </v-icon>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="cancelUFChange"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!selectedUfId"
          variant="elevated"
          @click="confirmUFChange"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
  import type { State } from '@/interfaces'
  import { defineComponent } from 'vue'
  import { UfService } from '@/services'
  import { AuthService } from '@/services/auth.service'
  import { useAuthStore } from '@/stores/auth'

  export default defineComponent({
    name: 'NavbarComponent',
    data () {
      return {
        drawer: false,
        ufDialog: false,
        ufSearch: '',
        selectedUfId: null as number | null,
        loading: false,
        ufs: [] as State[],
        menuItems: [
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
            title: 'Movimentação',
            icon: 'mdi-swap-horizontal',
            to: '/movimentacao',
          },
          {
            title: 'Usuários',
            icon: 'mdi-account-group',
            to: '/usuarios',
          },
          {
            title: 'Relatórios',
            icon: 'mdi-chart-line',
            to: '/relatorios',
          },
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
      ufText () {
        return this.auth.ufLabel ?? 'UF não definida'
      },
      filteredUFs () {
        if (!this.ufSearch) return this.ufs

        const search = this.ufSearch.toLowerCase()
        return this.ufs.filter(uf =>
          uf.sigla.toLowerCase().includes(search)
          || uf.nome.toLowerCase().includes(search),
        )
      },
    },
    async mounted () {
      try {
        this.loading = true
        this.ufs = await UfService.getAll()
        // Inicializar UF selecionada com a UF atual do usuário
        if (this.auth.ufId) {
          this.selectedUfId = this.auth.ufId
        }
      } catch (error) {
        console.error('Erro ao carregar UFs:', error)
      } finally {
        this.loading = false
      }
    },
    methods: {
      selectUF (ufId: number) {
        this.selectedUfId = ufId
      },
      cancelUFChange () {
        // Restaurar a UF atual ao cancelar
        this.selectedUfId = this.auth.ufId
        this.ufDialog = false
        this.ufSearch = ''
      },
      confirmUFChange () {
        if (this.selectedUfId) {
          const ufData = this.ufs.find(u => u.id === this.selectedUfId)
          if (ufData) {
            const ufLabel = `${ufData.sigla} - ${ufData.nome}`
            // Atualizar a UF no store de autenticação
            this.auth.setAuth({
              name: this.auth.userName,
              email: this.auth.userEmail || '',
              ufId: this.selectedUfId,
              ufLabel,
            })
          }
          this.ufDialog = false
          this.ufSearch = ''
        }
      },
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
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
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
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Melhorados os botões de navegação com hover states mais sofisticados */
.nav-btn {
  color: white !important;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
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
}

.location-badge,
.user-name {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

/* Adicionado estilo para badge clicável */
.location-badge.clickable {
  cursor: pointer;
}

.location-badge.clickable:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.location-badge:hover,
.user-name:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Adicionados estilos para o dialog de seleção de UF */
.uf-dialog {
  overflow: hidden;
}

.uf-dialog-header {
  background: linear-gradient(135deg, rgba(123, 44, 191, 0.05) 0%, rgba(156, 78, 214, 0.05) 100%);
  padding: 20px 24px;
}

.uf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.uf-card {
  border: 2px solid rgba(123, 44, 191, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.uf-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(123, 44, 191, 0.05) 0%, rgba(156, 78, 214, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.uf-card:hover {
  border-color: rgba(123, 44, 191, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(123, 44, 191, 0.15);
}

.uf-card:hover::before {
  opacity: 1;
}

.uf-card-selected {
  border-color: #7B2CBF !important;
  background: linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(156, 78, 214, 0.1) 100%);
}

.uf-card-selected::before {
  opacity: 1;
}

.uf-card-content {
  padding: 16px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.uf-sigla {
  font-size: 24px;
  font-weight: 700;
  color: #7B2CBF;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.uf-nome {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.uf-check {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Melhorado o scrollbar do grid de UFs */
.uf-grid::-webkit-scrollbar {
  width: 8px;
}

.uf-grid::-webkit-scrollbar-track {
  background: rgba(123, 44, 191, 0.05);
  border-radius: 4px;
}

.uf-grid::-webkit-scrollbar-thumb {
  background: rgba(123, 44, 191, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.uf-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(123, 44, 191, 0.5);
}

/* Melhorado o botão mobile com animação */
.mobile-menu-btn {
  color: rgb(0, 0, 0) !important;
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
}s

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
