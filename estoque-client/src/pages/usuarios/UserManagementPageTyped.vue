<template>
  <div class="user-management-page">
    <v-container class="pa-6" fluid>
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h3 font-weight-bold mb-2">
                <v-icon class="mr-3" icon="mdi-account-group" size="40" />
                Gerenciamento de Usuários
              </h1>
              <p class="text-h6 text-grey-darken-1">
                Visualize e gerencie todos os usuários do sistema
              </p>
            </div>
            <v-btn
              color="primary"
              elevation="2"
              prepend-icon="mdi-plus"
              size="large"
              @click="openCreateDialog"
            >
              Novo Usuário
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <UserStatsCards :stats="stats" />

      <!-- Filters and Table Card -->
      <v-row>
        <v-col cols="12">
          <UsersTable
            :filter-role="filterRole"
            :filter-status="filterStatus"
            :loading="loading"
            :search="search"
            :users="users"
            :pagination-total="paginationData.total"
            :pagination-page="paginationFilters.pagina"
            :pagination-items-per-page="paginationFilters.tamanho"
            @delete="deleteUser"
            @edit="editUser"
            @refresh="loadUsers"
            @update:filter-role="onFilterChange"
            @update:filter-status="onFilterChange"
            @update:search="onFilterChange"
            @update:page="onPageChange"
            @update:items-per-page="onItemsPerPageChange"
            @view="viewUser"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- View User Dialog -->
    <UserViewDialog
      v-model="viewDialog"
      :user="selectedUser"
    />

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      elevation="8"
      location="top right"
      :timeout="snackbar.timeout"
    >
      <div class="d-flex align-center">
        <v-icon
          class="mr-2"
          :icon="snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
        />
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
  import type { User } from '@/interfaces'
  import UsersTable from '@/components/usuarios/UsersTable.vue'
  import UserStatsCards from '@/components/usuarios/UserStatsCards.vue'
  import UserViewDialog from '@/components/usuarios/UserViewDialog.vue'
  import { UserService, UserStatsService } from '@/services'
  import { mapBackendToUser } from '@/utils/tramposes/user'

  export default {
    name: 'UserManagementPageTyped',
    components: {
      UserStatsCards,
      UserViewDialog,
      UsersTable,
    },
    data () {
      return {
        search: '',
        filterRole: 'Todos',
        filterStatus: 'Todos',
        viewDialog: false,
        selectedUser: null as User | null,
        loading: false,
        users: [] as User[],
        stats: {
          totalUsers: 0,
          activeUsersCount: 0,
          inactiveUsersCount: 0,
          adminCount: 0,
        },
        paginationFilters: {
          pagina: 1,
          tamanho: 10,
        },
        paginationData: {
          total: 0,
          pagina: 1,
          totalPaginas: 0,
        },
        snackbar: {
          show: false,
          text: '',
          color: 'success' as 'success' | 'error' | 'warning' | 'info',
          timeout: 3000,
        },
      }
    },
    mounted () {
      this.loadUsers()
    },
    methods: {
      onFilterChange () {
        // Quando um filtro muda, volta para a primeira página
        this.paginationFilters.pagina = 1
        this.loadUsers()
      },
      onPageChange (newPage: number) {
        // Quando a página muda na tabela, atualiza e faz requisição ao backend
        this.paginationFilters.pagina = newPage
        this.loadUsers()
      },
      onItemsPerPageChange (newItemsPerPage: number) {
        // Quando o tamanho da página muda na tabela, atualiza e faz requisição ao backend
        this.paginationFilters.tamanho = newItemsPerPage
        this.paginationFilters.pagina = 1 // Volta para a primeira página
        this.loadUsers()
      },
      async loadUsers () {
        this.loading = true
        try {
          // Constrói filtros para o backend
          const filters: {
            busca?: string
            role?: 'admin' | 'gerente' | 'operador' | 'visualizador'
            status?: 'ativo' | 'inativo'
            pagina?: number
            tamanho?: number
          } = {
            pagina: this.paginationFilters.pagina || 1,
            tamanho: this.paginationFilters.tamanho || 10,
          }

          if (this.search) {
            filters.busca = this.search
          }
          if (this.filterRole !== 'Todos') {
            filters.role = this.filterRole.toLowerCase() as 'admin' | 'gerente' | 'operador' | 'visualizador'
          }
          if (this.filterStatus !== 'Todos') {
            filters.status = this.filterStatus === 'Ativo' ? 'ativo' : 'inativo'
          }

          const [result, userStats] = await Promise.all([
            UserService.getAllFiltered(filters),
            UserStatsService.getStats(),
          ])

          // Verifica se retornou paginação ou array simples
          if (Array.isArray(result)) {
            this.users = result.map((backendUser, index) => mapBackendToUser(backendUser, index))
            this.paginationData = {
              total: result.length,
              pagina: 1,
              totalPaginas: 1,
            }
          } else {
            this.users = result.items.map((backendUser, index) => mapBackendToUser(backendUser, index))
            this.paginationData = {
              total: result.total,
              pagina: result.pagina || this.paginationFilters.pagina || 1,
              totalPaginas: result.totalPaginas,
            }
            // Sincroniza página atual
            if (this.paginationFilters.pagina !== this.paginationData.pagina) {
              this.paginationFilters.pagina = this.paginationData.pagina
            }
          }

          this.stats = userStats
          this.showSnackbar('Usuários carregados com sucesso!', 'success')
        } catch (error) {
          console.error('Erro ao buscar usuários:', error)
          this.showSnackbar('Erro ao carregar usuários', 'error')
        } finally {
          this.loading = false
        }
      },
      viewUser (user: User) {
        this.selectedUser = user
        this.viewDialog = true
      },
      editUser (user: User) {

        console.log('Edit user:', user)
        this.showSnackbar('Funcionalidade de edição em desenvolvimento', 'info')
      },
      deleteUser (user: User) {
       
        console.log('Delete user:', user)
        this.showSnackbar('Funcionalidade de exclusão em desenvolvimento', 'info')
      },
      openCreateDialog () {

        console.log('Open create dialog')
        this.showSnackbar('Funcionalidade de criação em desenvolvimento', 'info')
      },
      showSnackbar (text: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') {
        this.snackbar.text = text
        this.snackbar.color = color
        this.snackbar.show = true
      },
    },
  }
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  background: #000000;
  padding: 2rem 0;
}
</style>
