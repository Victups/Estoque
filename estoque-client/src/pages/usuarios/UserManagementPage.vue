<template>
  <div class="user-management-page">
    <v-container class="pa-6" fluid>
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" icon="mdi-account-group" size="28" />
                <h1 class="text-h5 font-weight-bold mb-0">
                  Gerenciamento de Usuários
                </h1>
              </div>
              <p class="text-body-1 text-medium-emphasis mb-0">
                Visualize e gerencie todos os usuários do sistema
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              variant="elevated"
              @click="handleCreateUser"
            >
              Novo Usuário
            </v-btn>
          </div>
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
                    :items="['Todos', 'Admin', 'Gerente', 'Operador', 'Visualizador']"
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
                    :items="['Todos', 'Ativo', 'Inativo']"
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
                    @click="fetchUsers"
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
                    :color="getRoleColor(item.role)"
                    size="small"
                    variant="flat"
                  >
                    <v-icon class="mr-1" :icon="getRoleIcon(item.role)" size="small" />
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
                        @click="handleEditUser(item)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip :location="'top'" :text="item.status === 'active' ? 'Inativar usuário' : 'Ativar usuário'">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :color="item.status === 'active' ? 'warning' : 'success'"
                        :icon="item.status === 'active' ? 'mdi-account-off' : 'mdi-account-check'"
                        size="small"
                        variant="tonal"
                        @click="handleToggleUserStatus(item)"
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

    <!-- Edit User Dialog -->
    <EditUserDialog
      v-model="editDialog"
      :loading="saving"
      :user="editingUser"
      @cancel="cancelEdit"
      @save="saveUser"
    />

    <!-- Create User Dialog -->
    <CreateUserDialog
      v-model="createDialog"
      :loading="saving"
      :ufs="ufs"
      @cancel="cancelCreate"
      @create="createUser"
    />

    <!-- Toggle Status Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card elevation="8">
        <v-card-title class="pa-4" :class="selectedUser?.status === 'active' ? 'bg-warning' : 'bg-success'">
          <v-icon class="mr-2" :icon="selectedUser?.status === 'active' ? 'mdi-account-off' : 'mdi-account-check'" size="30" />
          <span class="text-h5">{{ selectedUser?.status === 'active' ? 'Confirmar Inativação' : 'Confirmar Ativação' }}</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon :color="selectedUser?.status === 'active' ? 'warning' : 'success'" :icon="selectedUser?.status === 'active' ? 'mdi-account-off' : 'mdi-account-check'" size="80" />
          </div>
          <p class="text-h6 text-center">
            Tem certeza que deseja {{ selectedUser?.status === 'active' ? 'inativar' : 'ativar' }} o usuário
            <strong :class="selectedUser?.status === 'active' ? 'text-warning' : 'text-success'">{{ selectedUser?.name }}</strong>?
          </p>
          <p class="text-center text-grey mt-2">
            {{ selectedUser?.status === 'active' ? 'O usuário não poderá mais acessar o sistema.' : 'O usuário poderá acessar o sistema novamente.' }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            <v-icon class="mr-1" icon="mdi-close" />
            Cancelar
          </v-btn>
          <v-btn :color="selectedUser?.status === 'active' ? 'warning' : 'success'" variant="elevated" @click="confirmToggleStatus">
            <v-icon class="mr-1" :icon="selectedUser?.status === 'active' ? 'mdi-account-off' : 'mdi-account-check'" />
            {{ selectedUser?.status === 'active' ? 'Inativar' : 'Ativar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      elevation="8"
      location="top right"
      :timeout="4000"
    >
      <div class="d-flex align-center">
        <v-icon
          class="mr-2"
          :icon="snackbarColor === 'success' ? 'mdi-check-circle' : snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-information'"
        />
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
  import type { BackendUser, Contact, NewUserForm, State, User, UserRole } from '@/interfaces'
  import type { TableHeader } from '@/interfaces/ui/table'
  import { defineComponent } from 'vue'
  import CreateUserDialog from '@/components/usuarios/CreateUserDialog.vue'
  import EditUserDialog from '@/components/usuarios/EditUserDialog.vue'
  import { useUnauthorized } from '@/utils/useUnauthorized'
  import { ContactService, UserService } from '@/services'
  import { useUsersCacheStore } from '@/stores/usersCache'
  import { useAuthStore } from '@/stores/auth'
  import { getRoleColor, getRoleIcon, mapBackendToUser, mapUserRoleToBackendRole } from '@/utils/tramposes/user'

  export default defineComponent({
    name: 'UserManagementPage',
    components: {
      CreateUserDialog,
      EditUserDialog,
    },
    setup () {
      const { showUnauthorized } = useUnauthorized()
      const usersCache = useUsersCacheStore()
      return { showUnauthorized, usersCache }
    },
    data () {
      return {
        search: '' as string,
        filterRole: 'Todos' as string,
        filterStatus: 'Todos' as string,
        viewDialog: false as boolean,
        editDialog: false as boolean,
        deleteDialog: false as boolean,
        selectedUser: null as User | null,
        editingUser: null as User | null,
        snackbar: false as boolean,
        snackbarText: '' as string,
        snackbarColor: 'success' as string,
        loading: false as boolean,
        saving: false as boolean,
        users: [] as User[],
        createDialog: false as boolean,
        ufs: [] as State[],
        headers: [
          { title: '', key: 'avatar', sortable: false, width: '70px' },
          { title: 'Nome', key: 'name' },
          { title: 'Função', key: 'role' },
          { title: 'Status', key: 'status' },
          { title: 'Ações', key: 'actions', sortable: false, width: '180px' },
        ] as TableHeader[],
      }
    },
    computed: {
      auth () {
        return useAuthStore()
      },
      filteredUsers (): User[] {
        return this.users.filter(user => {
          const roleMatch = this.filterRole === 'Todos' || user.role === this.filterRole
          const statusMatch = this.filterStatus === 'Todos' || user.status === this.filterStatus
          return roleMatch && statusMatch
        })
      },
      canManageUsers () {
        return this.auth.role?.toLowerCase() === 'admin'
      },
      canCreateUsers () {
        return this.auth.role?.toLowerCase() === 'admin'
      },
    },
    mounted () {
      this.loadData()
    },
    methods: {
      async loadData (forceRefresh = false) {
        await Promise.all([
          this.fetchUsers(forceRefresh),
          this.loadUfs(forceRefresh),
        ])
      },
      async loadUfs (forceRefresh = false) {
        try {
          this.ufs = await this.usersCache.fetchUfs(forceRefresh)
        } catch (error) {
          console.error('Erro ao carregar UFs:', error)
        }
      },
      async fetchUsers (forceRefresh = false) {
        const cachedUsers = this.usersCache.getUsers()
        if (!forceRefresh && cachedUsers) {
          this.users = cachedUsers.map((backendUser, index) => mapBackendToUser(backendUser, index))
          this.loading = false
          return
        }

        this.loading = true
        try {
          const backendUsers = await this.usersCache.fetchUsers(forceRefresh)
          this.users = backendUsers.map((backendUser, index) => mapBackendToUser(backendUser, index))
        } catch (error) {
          console.error('Erro ao buscar usuários:', error)
          this.snackbarText = 'Erro ao carregar usuários'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.loading = false
        }
      },
      viewUser (user: User) {
        this.selectedUser = user
        this.viewDialog = true
      },
      handleEditUser (user: User) {
        if (!this.canManageUsers) {
          this.showUnauthorized('Apenas administradores podem editar usuários. Entre em contato com um administrador do sistema.')
          return
        }
        this.editUser(user)
      },
      editUser (user: User) {
        this.editingUser = { ...user }
        this.editDialog = true
      },
      cancelEdit () {
        this.editDialog = false
        this.editingUser = null
      },
      async saveUser (data: { user: User, changePassword: boolean, newPassword: string }) {
        this.saving = true
        try {
          const payload: Partial<BackendUser> = {
            nome: data.user.name || data.user.nome || '',
            email: data.user.email,
            role: mapUserRoleToBackendRole(data.user.role || 'Visualizador'),
            ativo: data.user.status !== 'inactive',
          }
          if (data.changePassword && data.newPassword) {
            payload.senha = data.newPassword
          }
          await UserService.update(data.user.id, payload)
          this.snackbarText = 'Usuário atualizado com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.editDialog = false
          this.editingUser = null
          this.usersCache.invalidateAfterUserMutation()
          await this.fetchUsers(true)
        } catch (error) {
          console.error('Erro ao atualizar usuário:', error)
          this.snackbarText = 'Erro ao atualizar usuário'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.saving = false
        }
      },
      handleToggleUserStatus (user: User) {
        if (!this.canManageUsers) {
          this.showUnauthorized('Apenas administradores podem alterar o status de usuários. Entre em contato com um administrador do sistema.')
          return
        }
        this.toggleUserStatus(user)
      },
      toggleUserStatus (user: User) {
        this.selectedUser = user
        this.deleteDialog = true
      },
      async confirmToggleStatus () {
        if (!this.selectedUser) return
        try {
          const activating = this.selectedUser.status !== 'active'
          await UserService.update(this.selectedUser.id, { ativo: activating })
          this.snackbarText = `Usuário ${this.selectedUser.name} ${activating ? 'ativado' : 'inativado'} com sucesso!`
          this.snackbarColor = 'success'
          this.snackbar = true
   
          this.usersCache.invalidateAfterUserMutation()
          await this.fetchUsers(true)
        } catch (error) {
          console.error('Erro ao alterar status do usuário:', error)
          this.snackbarText = 'Erro ao alterar status do usuário'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.deleteDialog = false
          this.selectedUser = null
        }
      },
      handleCreateUser () {
        if (!this.canCreateUsers) {
          this.showUnauthorized('Apenas administradores podem criar usuários. Entre em contato com um administrador do sistema.')
          return
        }
        this.createDialog = true
      },
      cancelCreate () {
        this.createDialog = false
      },
      async createUser (userData: NewUserForm) {
        this.saving = true
        try {
          const emailExists = await UserService.emailExists(userData.email)
          if (emailExists) {
            this.snackbarText = 'Este e-mail já está cadastrado'
            this.snackbarColor = 'error'
            this.snackbar = true
            return
          }

          let contactId: number | undefined
          if (userData.tipo_contato && userData.valor_contato) {
            const contact = await ContactService.create({
              nome: userData.name,
              valor: userData.valor_contato,
              tipo_contato: userData.tipo_contato as Contact['tipo_contato'],
              codigo_pais: userData.codigo_pais || null,
            })
            contactId = contact.id
          }

          const createdUser = await UserService.create({
            nome: userData.name,
            email: userData.email,
            senha: userData.password,
            role: mapUserRoleToBackendRole(userData.role || 'Visualizador'),
            id_contato: contactId,
            id_uf: userData.id_uf ?? undefined,
            ativo: true,
          })

          this.users.push(mapBackendToUser(createdUser, this.users.length))

          this.snackbarText = 'Usuário criado com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.createDialog = false
          this.usersCache.invalidateAfterUserMutation()
          await this.fetchUsers(true)
        } catch (error) {
          console.error('Erro ao criar usuário:', error)
          this.snackbarText = 'Erro ao criar usuário'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.saving = false
        }
      },
      getRoleColor,
      getRoleIcon,
    },
  })
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  background: #000000;
  padding: 2rem 0;
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
  background: linear-gradient(135deg, #000000 0%, #000000 100%);
  color: white;
}

:deep(.v-card-title.bg-error) {
  background: linear-gradient(135deg, #fb93aa 0%, #f5576c 100%);
  color: white;
}
</style>
