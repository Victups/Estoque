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
      <v-row class="mb-6">
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="primary" size="56">
                  <v-icon icon="mdi-account-multiple" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Total de Usuários</p>
                  <h2 class="text-h4 font-weight-bold">{{ stats.totalUsers }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="success" size="56">
                  <v-icon icon="mdi-account-check" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Ativos</p>
                  <h2 class="text-h4 font-weight-bold">{{ stats.activeUsersCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="warning" size="56">
                  <v-icon icon="mdi-shield-account" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Administradores</p>
                  <h2 class="text-h4 font-weight-bold">{{ stats.adminCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="info" size="56">
                  <v-icon icon="mdi-account-clock" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Inativos</p>
                  <h2 class="text-h4 font-weight-bold">{{ stats.inactiveUsersCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters and Table Card -->
      <v-row>
        <v-col cols="12">
          <v-card class="main-card" elevation="3">
            <v-card-title class="bg-primary pa-4">
              <v-icon class="mr-2" icon="mdi-format-list-bulleted" />
              <span class="text-h5">Lista de Usuários</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Filters -->
              <v-row class="mb-4">
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="search"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Buscar usuários"
                    placeholder="Digite nome ou email..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterRole"
                    density="comfortable"
                    hide-details
                    :items="roleFilterOptions"
                    label="Filtrar por Função"
                    prepend-inner-icon="mdi-filter"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterStatus"
                    density="comfortable"
                    hide-details
                    :items="statusFilterOptions"
                    label="Filtrar por Status"
                    prepend-inner-icon="mdi-filter-variant"
                    variant="outlined"
                  />
                </v-col>
                <v-col class="d-flex align-center" cols="12" md="1">
                  <v-btn
                    color="grey-darken-1"
                    icon="mdi-refresh"
                    variant="outlined"
                    @click="loadUsers"
                  />
                </v-col>
              </v-row>

              <!-- Data Table -->
              <v-data-table
                class="elevation-1"
                :headers="headers"
                :items="filteredUsers"
                :items-per-page="10"
                :loading="loading"
                loading-text="Carregando usuários..."
                :search="search"
              >
                <template #item.avatar="{ item }">
                  <v-avatar :color="item.avatarColor" size="45">
                    <span class="text-h6 text-white font-weight-bold">{{ item.initials }}</span>
                  </v-avatar>
                </template>

                <template #item.name="{ item }">
                  <div>
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption text-grey">{{ item.email }}</div>
                  </div>
                </template>

                <template #item.role="{ item }">
                  <v-chip
                    class="font-weight-bold"
                    :color="userHelpers.getRoleColor(item.role)"
                    size="small"
                    variant="flat"
                  >
                    <v-icon class="mr-1" :icon="userHelpers.getRoleIcon(item.role)" size="small" />
                    {{ item.role }}
                  </v-chip>
                </template>

                <template #item.status="{ item }">
                  <v-chip
                    :color="item.status === 'active' ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    <v-icon
                      class="mr-1"
                      :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-close-circle'"
                      size="small"
                    />
                    {{ item.status }}
                  </v-chip>
                </template>

                <template #item.actions="{ item }">
                  <v-tooltip location="top" text="Ver detalhes">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="mr-1"
                        color="info"
                        icon="mdi-eye"
                        size="small"
                        variant="tonal"
                        @click="viewUser(item)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip location="top" text="Editar usuário">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="mr-1"
                        color="primary"
                        icon="mdi-pencil"
                        size="small"
                        variant="tonal"
                        @click="editUser(item)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip location="top" text="Excluir usuário">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="error"
                        icon="mdi-delete"
                        size="small"
                        variant="tonal"
                        @click="deleteUser(item)"
                      />
                    </template>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- View User Dialog -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card v-if="selectedUser" elevation="8">
        <v-card-title class="bg-primary pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2" icon="mdi-account-circle" size="30" />
              <span class="text-h5">Detalhes do Usuário</span>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
          </div>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <v-avatar class="mb-3" :color="selectedUser.avatarColor" size="100">
              <span class="text-h3 text-white font-weight-bold">{{ selectedUser.initials }}</span>
            </v-avatar>
            <h2 class="text-h4 mb-1">{{ selectedUser.name }}</h2>
            <p class="text-h6 text-grey">{{ selectedUser.email }}</p>
          </div>

          <v-divider class="mb-4" />

          <v-row>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-shield-account" />
                </template>
                <v-list-item-title class="font-weight-bold">Função</v-list-item-title>
                <v-list-item-subtitle>{{ selectedUser.role }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-information" />
                </template>
                <v-list-item-title class="font-weight-bold">Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="selectedUser.status === 'active' ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    {{ selectedUser.status }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-clock-outline" />
                </template>
                <v-list-item-title class="font-weight-bold">Último acesso</v-list-item-title>
                <v-list-item-subtitle>{{ selectedUser.lastAccess }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbarState.snackbar.value"
      :color="snackbarState.snackbarColor.value"
      elevation="8"
      location="top right"
      :timeout="snackbarState.snackbarTimeout.value"
    >
      <div class="d-flex align-center">
        <v-icon
          class="mr-2"
          :icon="snackbarState.snackbarColor.value === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
        />
        {{ snackbarState.snackbarText.value }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import type { User } from '@/types'
  import { computed, onMounted, ref } from 'vue'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { useUser, useUserStats } from '@/composables/useUser'
  import { UserService } from '@/services'

  // Composables
  const userHelpers = useUser()
  const snackbarState = useSnackbar()

  // State
  const search = ref<string>('')
  const filterRole = ref<string>('Todos')
  const filterStatus = ref<string>('Todos')
  const viewDialog = ref<boolean>(false)
  const selectedUser = ref<User | null>(null)
  const loading = ref<boolean>(false)
  const users = ref<User[]>([])

  // Computed
  const stats = useUserStats(users)

  const filteredUsers = computed<User[]>(() => {
    return users.value.filter((user: User) => {
      const roleMatch = filterRole.value === 'Todos' || user.role === filterRole.value
      const statusMatch = filterStatus.value === 'Todos' || user.status === filterStatus.value
      return roleMatch && statusMatch
    })
  })

  // Constants
  const roleFilterOptions = ['Todos', 'Admin', 'Gerente', 'Operador', 'Visualizador']
  const statusFilterOptions = ['Todos', 'Ativo', 'Inativo']

  interface TableHeader {
    title: string
    key: string
    sortable?: boolean
    width?: string
  }

  const headers: TableHeader[] = [
    { title: '', key: 'avatar', sortable: false, width: '70px' },
    { title: 'Nome', key: 'name' },
    { title: 'Função', key: 'role' },
    { title: 'Status', key: 'status' },
    { title: 'Ações', key: 'actions', sortable: false, width: '180px' },
  ]

  // Methods
  async function loadUsers (): Promise<void> {
    loading.value = true
    try {
      const backendUsers = await UserService.getAll()
      users.value = backendUsers.map(userHelpers.mapBackendToUser)
      snackbarState.showSuccess('Usuários carregados com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao buscar usuários:', error)
      snackbarState.showError('Erro ao carregar usuários. Verifique se o backend está rodando.')
    } finally {
      loading.value = false
    }
  }

  function viewUser (user: User): void {
    selectedUser.value = user
    viewDialog.value = true
  }

  function editUser (user: User): void {
    // Implementar modal de edição
    console.log('Edit user:', user)
  }

  function deleteUser (user: User): void {
    // Implementar confirmação de exclusão
    console.log('Delete user:', user)
  }

  function openCreateDialog (): void {
    // Implementar modal de criação
    console.log('Open create dialog')
  }

  onMounted(() => {
    loadUsers()
  })
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  background: #000000;
  padding: 2rem 0;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table tbody tr) {
  transition: background-color 0.2s ease;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-card-title.bg-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
