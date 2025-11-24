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
            @delete="deleteUser"
            @edit="editUser"
            @refresh="loadUsers"
            @update:filter-role="filterRole = $event"
            @update:filter-status="filterStatus = $event"
            @update:search="search = $event"
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
  import { UserService } from '@/services'
  import { mapBackendToUser } from '@/utils/tramposes/user'
  import { getUserStats } from '@/utils/tramposes/userFilters'

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
        snackbar: {
          show: false,
          text: '',
          color: 'success' as 'success' | 'error' | 'warning' | 'info',
          timeout: 3000,
        },
      }
    },
    computed: {
      stats () {
        return getUserStats(this.users)
      },
    },
    mounted () {
      this.loadUsers()
    },
    methods: {
      async loadUsers () {
        this.loading = true
        try {
          const backendUsers = await UserService.getAll()
          this.users = backendUsers.map((backendUser, index) => mapBackendToUser(backendUser, index))
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
        // Implementar modal de edição
        console.log('Edit user:', user)
        this.showSnackbar('Funcionalidade de edição em desenvolvimento', 'info')
      },
      deleteUser (user: User) {
        // Implementar confirmação de exclusão
        console.log('Delete user:', user)
        this.showSnackbar('Funcionalidade de exclusão em desenvolvimento', 'info')
      },
      openCreateDialog () {
        // Implementar modal de criação
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
