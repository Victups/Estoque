<template>
  <div class="user-management-page">
    <v-container fluid class="pa-6">
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h3 font-weight-bold mb-2">
                <v-icon icon="mdi-account-group" size="40" class="mr-3" />
                Gerenciamento de Usuários
              </h1>
              <p class="text-h6 text-grey-darken-1">
                Visualize e gerencie todos os usuários do sistema
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              size="large"
              elevation="2"
              @click="goToRegistration"
            >
              Novo Usuário
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="primary" size="56" class="mr-4">
                  <v-icon icon="mdi-account-multiple" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Total de Usuários</p>
                  <h2 class="text-h4 font-weight-bold">{{ users.length }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="success" size="56" class="mr-4">
                  <v-icon icon="mdi-account-check" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Ativos</p>
                  <h2 class="text-h4 font-weight-bold">{{ activeUsersCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="warning" size="56" class="mr-4">
                  <v-icon icon="mdi-shield-account" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Administradores</p>
                  <h2 class="text-h4 font-weight-bold">{{ adminCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="info" size="56" class="mr-4">
                  <v-icon icon="mdi-account-clock" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Novos (Este mês)</p>
                  <h2 class="text-h4 font-weight-bold">{{ users.length }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters and Table Card -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="3" class="main-card">
            <v-card-title class="bg-primary pa-4">
              <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
              <span class="text-h5">Lista de Usuários</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Filters -->
              <v-row class="mb-4">
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="search"
                    density="comfortable"
                    hide-details
                    label="Buscar usuários"
                    placeholder="Digite nome ou email..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
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
                <v-col cols="12" md="1" class="d-flex align-center">
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
                :headers="headers"
                :items="filteredUsers"
                :items-per-page="10"
                :loading="loading"
                loading-text="Carregando usuários..."
                :search="search"
                class="elevation-1"
              >
                <template v-slot:item.avatar="{ item }">
                  <v-avatar :color="item.avatarColor" size="45">
                    <span class="text-h6 text-white font-weight-bold">{{ item.initials }}</span>
                  </v-avatar>
                </template>

                <template v-slot:item.name="{ item }">
                  <div>
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption text-grey">{{ item.email }}</div>
                  </div>
                </template>

                <template v-slot:item.role="{ item }">
                  <v-chip
                    :color="getRoleColor(item.role)"
                    variant="flat"
                    size="small"
                    class="font-weight-bold"
                  >
                    <v-icon :icon="getRoleIcon(item.role)" size="small" class="mr-1" />
                    {{ item.role }}
                  </v-chip>
                </template>

                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="item.status === 'Ativo' ? 'success' : 'error'"
                    variant="flat"
                    size="small"
                  >
                    <v-icon
                      :icon="item.status === 'Ativo' ? 'mdi-check-circle' : 'mdi-close-circle'"
                      size="small"
                      class="mr-1"
                    />
                    {{ item.status }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-tooltip text="Ver detalhes" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="info"
                        icon="mdi-eye"
                        size="small"
                        variant="tonal"
                        class="mr-1"
                        @click="viewUser(item)"
                      />
                    </template>
                  </v-tooltip>
                  
                  <v-tooltip text="Editar usuário" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="primary"
                        icon="mdi-pencil"
                        size="small"
                        variant="tonal"
                        class="mr-1"
                        @click="editUser(item)"
                      />
                    </template>
                  </v-tooltip>
                  
                  <v-tooltip text="Excluir usuário" location="top">
                    <template v-slot:activator="{ props }">
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
              <v-icon icon="mdi-account-circle" class="mr-2" size="30" />
              <span class="text-h5">Detalhes do Usuário</span>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
          </div>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <v-avatar :color="selectedUser.avatarColor" size="100" class="mb-3">
              <span class="text-h3 text-white font-weight-bold">{{ selectedUser.initials }}</span>
            </v-avatar>
            <h2 class="text-h4 mb-1">{{ selectedUser.name }}</h2>
            <p class="text-h6 text-grey">{{ selectedUser.email }}</p>
          </div>

          <v-divider class="mb-4" />

          <v-row>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-shield-account" color="primary" />
                </template>
                <v-list-item-title class="font-weight-bold">Função</v-list-item-title>
                <v-list-item-subtitle>{{ selectedUser.role }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-office-building" color="primary" />
                </template>
                <v-list-item-title class="font-weight-bold">Departamento</v-list-item-title>
                <v-list-item-subtitle>{{ selectedUser.department }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-information" color="primary" />
                </template>
                <v-list-item-title class="font-weight-bold">Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="selectedUser.status === 'Ativo' ? 'success' : 'error'"
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
                <template v-slot:prepend>
                  <v-icon icon="mdi-clock-outline" color="primary" />
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
    <v-dialog v-model="editDialog" max-width="800" persistent>
      <v-card v-if="editingUser" elevation="8">
        <v-card-title class="bg-primary pa-4">
          <div class="d-flex align-center">
            <v-icon icon="mdi-account-edit" class="mr-2" size="30" />
            <span class="text-h5">Editar Usuário</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="editForm" v-model="validForm">
            <v-row>
              <v-col cols="12" class="text-center mb-4">
                <v-avatar :color="editingUser.avatarColor" size="80">
                  <span class="text-h4 text-white">{{ editingUser.initials }}</span>
                </v-avatar>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingUser.name"
                  density="comfortable"
                  label="Nome Completo"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingUser.email"
                  density="comfortable"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.role"
                  density="comfortable"
                  :items="['Admin', 'Gerente', 'Operador', 'Visualizador']"
                  label="Função"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.department"
                  density="comfortable"
                  :items="['TI', 'Gestão', 'Estoque', 'Vendas', 'Financeiro', 'Geral']"
                  label="Departamento"
                  prepend-inner-icon="mdi-office-building"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.status"
                  density="comfortable"
                  :items="['Ativo', 'Inativo']"
                  label="Status"
                  prepend-inner-icon="mdi-information"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="my-4" />
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6">
                    <v-icon icon="mdi-lock" class="mr-2" />
                    Alterar Senha
                  </h3>
                  <v-switch
                    v-model="changePassword"
                    color="primary"
                    hide-details
                    label="Alterar senha"
                  />
                </div>
              </v-col>

              <template v-if="changePassword">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newPassword"
                    density="comfortable"
                    label="Nova Senha"
                    prepend-inner-icon="mdi-lock"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    variant="outlined"
                    :rules="changePassword ? [rules.required, rules.minLength] : []"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="confirmPassword"
                    density="comfortable"
                    label="Confirmar Nova Senha"
                    prepend-inner-icon="mdi-lock-check"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    variant="outlined"
                    :rules="changePassword ? [rules.required, rules.passwordMatch] : []"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  />
                </v-col>
              </template>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEdit"
          >
            <v-icon icon="mdi-close" class="mr-1" />
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!validForm"
            :loading="saving"
            @click="saveUser"
          >
            <v-icon icon="mdi-content-save" class="mr-1" />
            Salvar Alterações
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create User Dialog -->
    <v-dialog v-model="createDialog" max-width="800" persistent>
      <v-card elevation="8">
        <v-card-title class="bg-primary pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" icon="mdi-account-plus" size="30" />
            <span class="text-h5">Criar Novo Usuário</span>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="createForm" v-model="validCreateForm">
            <v-row>
              <!-- Personal Information Section -->
              <v-col cols="12">
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-account-circle</v-icon>
                  Informações Pessoais
                </h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.name"
                  density="comfortable"
                  hide-details="auto"
                  label="Nome Completo"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.email"
                  density="comfortable"
                  hide-details="auto"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                />
              </v-col>

              <!-- Professional Information Section -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-briefcase</v-icon>
                  Informações Profissionais
                </h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.role"
                  density="comfortable"
                  hide-details="auto"
                  :items="['Admin', 'Gerente', 'Operador', 'Visualizador']"
                  label="Função"
                  prepend-inner-icon="mdi-shield-account"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.department"
                  density="comfortable"
                  hide-details="auto"
                  :items="['TI', 'Gestão', 'Estoque', 'Vendas', 'Financeiro', 'Geral']"
                  label="Departamento"
                  prepend-inner-icon="mdi-office-building"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Security Section -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-shield-lock</v-icon>
                  Segurança
                </h3>
                <v-alert
                  class="mb-4"
                  color="info"
                  icon="mdi-information"
                  variant="tonal"
                >
                  A senha deve ter no mínimo 6 caracteres
                </v-alert>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.password"
                  :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  density="comfortable"
                  hide-details="auto"
                  label="Senha"
                  prepend-inner-icon="mdi-lock"
                  :type="showNewPassword ? 'text' : 'password'"
                  variant="outlined"
                  :rules="[rules.required, rules.minLength]"
                  @click:append-inner="showNewPassword = !showNewPassword"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.confirmPassword"
                  :append-inner-icon="showNewConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  density="comfortable"
                  hide-details="auto"
                  label="Confirmar Senha"
                  prepend-inner-icon="mdi-lock-check"
                  :type="showNewConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
                  :rules="[rules.required, rules.newPasswordMatch]"
                  @click:append-inner="showNewConfirmPassword = !showNewConfirmPassword"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelCreate"
          >
            <v-icon class="mr-1" icon="mdi-close" />
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!validCreateForm"
            :loading="saving"
            variant="elevated"
            @click="createUser"
          >
            <v-icon class="mr-1" icon="mdi-account-plus" />
            Criar Usuário
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card elevation="8">
        <v-card-title class="bg-error pa-4">
          <v-icon icon="mdi-alert-circle" class="mr-2" size="30" />
          <span class="text-h5">Confirmar Exclusão</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon icon="mdi-delete-alert" size="80" color="error" />
          </div>
          <p class="text-h6 text-center">
            Tem certeza que deseja excluir o usuário
            <strong class="text-error">{{ selectedUser?.name }}</strong>?
          </p>
          <p class="text-center text-grey mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            <v-icon icon="mdi-close" class="mr-1" />
            Cancelar
          </v-btn>
          <v-btn color="error" variant="elevated" @click="confirmDelete">
            <v-icon icon="mdi-delete" class="mr-1" />
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top right"
      elevation="8"
    >
      <div class="d-flex align-center">
        <v-icon
          :icon="snackbarColor === 'success' ? 'mdi-check-circle' : snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-information'"
          class="mr-2"
        />
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import type { User, BackendUser, UserRole, Department, ValidationRule } from '@/types'

  const search = ref<string>('')
  const filterRole = ref<string>('Todos')
  const filterStatus = ref<string>('Todos')
  const viewDialog = ref<boolean>(false)
  const editDialog = ref<boolean>(false)
  const deleteDialog = ref<boolean>(false)
  const selectedUser = ref<User | null>(null)
  const editingUser = ref<User | null>(null)
  const snackbar = ref<boolean>(false)
  const snackbarText = ref<string>('')
  const snackbarColor = ref<string>('success')
  const loading = ref<boolean>(false)
  const saving = ref<boolean>(false)
  const users = ref<User[]>([])
  const validForm = ref<boolean>(false)
  const changePassword = ref<boolean>(false)
  const newPassword = ref<string>('')
  const confirmPassword = ref<string>('')
  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)
  const createDialog = ref<boolean>(false)
  interface NewUserForm {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: UserRole | ''
    department: Department | ''
  }

  const newUser = ref<NewUserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
  })
  const showNewPassword = ref<boolean>(false)
  const showNewConfirmPassword = ref<boolean>(false)
  const validCreateForm = ref<boolean>(false)

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
    { title: 'Departamento', key: 'department' },
    { title: 'Status', key: 'status' },
    { title: 'Ações', key: 'actions', sortable: false, width: '180px' },
  ]

  interface FormRules {
    required: ValidationRule
    email: ValidationRule
    minLength: ValidationRule
    passwordMatch: ValidationRule
    newPasswordMatch: ValidationRule
  }

  const rules: FormRules = {
    required: (v: string): boolean | string => !!v || 'Campo obrigatório',
    email: (v: string): boolean | string => /.+@.+\..+/.test(v) || 'Email inválido',
    minLength: (v: string): boolean | string => (v && v.length >= 6) || 'Mínimo de 6 caracteres',
    passwordMatch: (v: string): boolean | string => v === newPassword.value || 'As senhas não coincidem',
    newPasswordMatch: (v: string): boolean | string => v === newUser.value.password || 'As senhas não coincidem',
  }

  const activeUsersCount = computed(() => {
    return users.value.filter(u => u.status === 'Ativo').length
  })

  const adminCount = computed(() => {
    return users.value.filter(u => u.role === 'Admin').length
  })

  const filteredUsers = computed<User[]>(() => {
    return users.value.filter(user => {
      const roleMatch = filterRole.value === 'Todos' || user.role === filterRole.value
      const statusMatch = filterStatus.value === 'Todos' || user.status === filterStatus.value
      return roleMatch && statusMatch
    })
  })

  function getInitials (name: string): string {
    const names = name.split(' ')
    if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  function determineRole (name: string, email: string): UserRole {
    const nameLower = name.toLowerCase()
    const emailLower = email.toLowerCase()

    if (nameLower.includes('admin') || emailLower.includes('admin')) return 'Admin'
    if (nameLower.includes('gerente')) return 'Gerente'
    if (nameLower.includes('almoxarife')) return 'Operador'
    return 'Visualizador'
  }

  function determineDepartment (name: string): Department {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('admin')) return 'TI'
    if (nameLower.includes('gerente')) return 'Gestão'
    if (nameLower.includes('almoxarife')) return 'Estoque'
    return 'Geral'
  }

  function getAvatarColor (index: number): string {
    const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
    return colors[index % colors.length] ?? 'primary'
  }

  function getRoleColor (role: UserRole): string {
    const colors: Record<UserRole, string> = {
      Admin: 'error',
      Gerente: 'warning',
      Operador: 'info',
      Visualizador: 'grey',
    }
    return colors[role]
  }

  function getRoleIcon (role: UserRole): string {
    const icons: Record<UserRole, string> = {
      Admin: 'mdi-shield-crown',
      Gerente: 'mdi-account-tie',
      Operador: 'mdi-account-wrench',
      Visualizador: 'mdi-account-eye',
    }
    return icons[role]
  }

  async function fetchUsers (): Promise<void> {
    loading.value = true
    try {
      const response = await fetch('http://localhost:3001/usuarios')
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }
      const data: unknown = await response.json()
      
      // O db.json retorna array aninhado [[...]], então pegamos o primeiro elemento
      const usuariosArray: BackendUser[] = Array.isArray(data) && Array.isArray(data[0]) 
        ? data[0] 
        : Array.isArray(data) ? data : []

      users.value = usuariosArray.map((user: BackendUser, index: number): User => ({
        id: user.id,
        name: user.nome,
        email: user.email,
        role: determineRole(user.nome, user.email),
        department: determineDepartment(user.nome),
        status: 'Ativo',
        lastAccess: new Date().toLocaleString('pt-BR'),
        initials: getInitials(user.nome),
        avatarColor: getAvatarColor(index),
      }))

      snackbarText.value = 'Usuários carregados com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true
    } catch (error: unknown) {
      console.error('Erro ao buscar usuários:', error)
      snackbarText.value = 'Erro ao carregar usuários. Verifique se o backend está rodando.'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      loading.value = false
    }
  }

  function viewUser (user: User): void {
    selectedUser.value = user
    viewDialog.value = true
  }

  function editUser (user: User): void {
    editingUser.value = { ...user }
    changePassword.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    editDialog.value = true
  }

  function cancelEdit (): void {
    editDialog.value = false
    editingUser.value = null
    changePassword.value = false
    newPassword.value = ''
    confirmPassword.value = ''
  }

  async function saveUser (): Promise<void> {
    if (!editingUser.value) return

    saving.value = true
    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : Array.isArray(allData) ? allData : []
      
      // Atualizar o usuário específico no array
      const userIndex = usuariosArray.findIndex((u: BackendUser) => u.id === editingUser.value!.id)
      if (userIndex !== -1) {
        usuariosArray[userIndex] = {
          ...usuariosArray[userIndex],
          nome: editingUser.value.name,
          email: editingUser.value.email,
        }

        // Adicionar senha se estiver alterando
        if (changePassword.value && newPassword.value) {
          usuariosArray[userIndex].senha = newPassword.value
        }
      }

      // Salvar o array atualizado
      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([usuariosArray]),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário')
      }

      // Atualizar usuário na lista local
      const index = users.value.findIndex((u: User) => u.id === editingUser.value!.id)
      if (index !== -1) {
        users.value[index] = {
          ...editingUser.value,
          initials: getInitials(editingUser.value.name),
        }
      }

      snackbarText.value = 'Usuário atualizado com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true
      editDialog.value = false
      editingUser.value = null
      changePassword.value = false
      newPassword.value = ''
      confirmPassword.value = ''
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error)
      snackbarText.value = 'Erro ao atualizar usuário'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      saving.value = false
    }
  }

  function deleteUser (user: User): void {
    selectedUser.value = user
    deleteDialog.value = true
  }

  async function confirmDelete (): Promise<void> {
    if (!selectedUser.value) return

    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : Array.isArray(allData) ? allData : []
      
      // Remover o usuário do array
      const updatedArray = usuariosArray.filter((u: BackendUser) => u.id !== selectedUser.value!.id)

      // Salvar o array atualizado
      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([updatedArray]),
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário')
      }

      users.value = users.value.filter((u: User) => u.id !== selectedUser.value!.id)
      snackbarText.value = `Usuário ${selectedUser.value.name} excluído com sucesso!`
      snackbarColor.value = 'success'
      snackbar.value = true
    } catch (error: unknown) {
      console.error('Erro ao excluir usuário:', error)
      snackbarText.value = 'Erro ao excluir usuário'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      deleteDialog.value = false
      selectedUser.value = null
    }
  }

  function goToRegistration (): void {
    newUser.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
    }
    createDialog.value = true
  }

  function cancelCreate (): void {
    createDialog.value = false
    newUser.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
    }
  }

  async function createUser (): Promise<void> {
    saving.value = true
    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : Array.isArray(allData) ? allData : []

      // Verificar se o email já existe
      const emailExists = usuariosArray.some((u: BackendUser) => u.email === newUser.value.email)
      if (emailExists) {
        snackbarText.value = 'Este e-mail já está cadastrado'
        snackbarColor.value = 'error'
        snackbar.value = true
        saving.value = false
        return
      }

      // Gerar novo ID
      const newId: number = usuariosArray.length > 0
        ? Math.max(...usuariosArray.map((u: BackendUser) => u.id)) + 1
        : 1

      // Criar novo usuário
      const newUserData: BackendUser = {
        id: newId,
        nome: newUser.value.name,
        email: newUser.value.email,
        senha: newUser.value.password,
        id_contato: newId,
      }

      // Adicionar ao array
      usuariosArray.push(newUserData)

      // Salvar o array atualizado
      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([usuariosArray]),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar usuário')
      }

      // Adicionar à lista local
      const newUserLocal: User = {
        id: newId,
        name: newUser.value.name,
        email: newUser.value.email,
        role: newUser.value.role as UserRole,
        department: newUser.value.department as Department,
        status: 'Ativo',
        lastAccess: new Date().toLocaleString('pt-BR'),
        initials: getInitials(newUser.value.name),
        avatarColor: getAvatarColor(users.value.length),
      }
      users.value.push(newUserLocal)

      snackbarText.value = 'Usuário criado com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true
      createDialog.value = false
      newUser.value = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: '',
      }
    } catch (error: unknown) {
      console.error('Erro ao criar usuário:', error)
      snackbarText.value = 'Erro ao criar usuário'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    fetchUsers()
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
  background: linear-gradient(135deg, #000000 0%, #000000 100%);
  color: white;
}

:deep(.v-card-title.bg-error) {
  background: linear-gradient(135deg, #fb93aa 0%, #f5576c 100%);
  color: white;
}
</style>
