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
              elevation="2"
              prepend-icon="mdi-plus"
              size="large"
              @click="handleCreateUser"
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
                  <h2 class="text-h4 font-weight-bold">{{ users.length }}</h2>
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
                  <h2 class="text-h4 font-weight-bold">{{ activeUsersCount }}</h2>
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
                  <h2 class="text-h4 font-weight-bold">{{ adminCount }}</h2>
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
    <v-dialog v-model="editDialog" max-width="800" persistent>
      <v-card v-if="editingUser" elevation="8">
        <v-card-title class="bg-primary pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" icon="mdi-account-edit" size="30" />
            <span class="text-h5">Editar Usuário</span>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="editForm" v-model="validForm">
            <v-row>
              <v-col class="text-center mb-4" cols="12">
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
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingUser.email"
                  density="comfortable"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  :rules="[rules.required, rules.email]"
                  type="email"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.role"
                  density="comfortable"
                  :items="['Admin', 'Gerente', 'Operador', 'Visualizador']"
                  label="Função"
                  prepend-inner-icon="mdi-shield-account"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.status"
                  density="comfortable"
                  :items="['Ativo', 'Inativo']"
                  label="Status"
                  prepend-inner-icon="mdi-information"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="my-4" />
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6">
                    <v-icon class="mr-2" icon="mdi-lock" />
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
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    density="comfortable"
                    label="Nova Senha"
                    prepend-inner-icon="mdi-lock"
                    :rules="changePassword ? [rules.required, rules.minLength] : []"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="confirmPassword"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    density="comfortable"
                    label="Confirmar Nova Senha"
                    prepend-inner-icon="mdi-lock-check"
                    :rules="changePassword ? [rules.required, rules.passwordMatch] : []"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    variant="outlined"
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
            <v-icon class="mr-1" icon="mdi-close" />
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!validForm"
            :loading="saving"
            variant="elevated"
            @click="saveUser"
          >
            <v-icon class="mr-1" icon="mdi-content-save" />
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
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.email"
                  density="comfortable"
                  hide-details="auto"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  :rules="[rules.required, rules.email]"
                  type="email"
                  variant="outlined"
                />
              </v-col>

              <!-- Contact Information Section -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-phone</v-icon>
                  Informações de Contato
                </h3>
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="newUser.tipo_contato"
                  density="comfortable"
                  hide-details="auto"
                  :items="[
                    { title: 'Telefone', value: 'telefone' },
                    { title: 'WhatsApp', value: 'whatsapp' },
                    { title: 'Email', value: 'email' },
                    { title: 'Instagram', value: 'instagram' },
                    { title: 'Telegram', value: 'telegram' },
                    { title: 'Outro', value: 'outro' }
                  ]"
                  label="Tipo de Contato"
                  prepend-inner-icon="mdi-phone"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newUser.valor_contato"
                  density="comfortable"
                  hide-details="auto"
                  label="Valor do Contato"
                  :mask="getContactMask(newUser.tipo_contato)"
                  prepend-inner-icon="mdi-account-voice"
                  :rules="[rules.required]"
                  variant="outlined"
                  @input="formatContactValue"
                  @keypress="onContactKeypress"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newUser.codigo_pais"
                  density="comfortable"
                  hide-details="auto"
                  label="Código do País"
                  prepend-inner-icon="mdi-flag"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <!-- Address Information Section -->
              <v-col cols="12">
                <v-divider class="my-4" />
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-map-marker</v-icon>
                  Informações de Endereço
                </h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.id_uf"
                  density="comfortable"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="ufOptions"
                  label="UF"
                  prepend-inner-icon="mdi-map"
                  :rules="[rules.required]"
                  variant="outlined"
                  @update:model-value="onUfChange"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.id_municipio"
                  density="comfortable"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="municipioOptions"
                  label="Município"
                  prepend-inner-icon="mdi-city"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newUser.logradouro"
                  density="comfortable"
                  hide-details="auto"
                  label="Logradouro"
                  prepend-inner-icon="mdi-road"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newUser.numero"
                  density="comfortable"
                  hide-details="auto"
                  label="Número"
                  prepend-inner-icon="mdi-numeric"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.complemento"
                  density="comfortable"
                  hide-details="auto"
                  label="Complemento"
                  prepend-inner-icon="mdi-home"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="newUser.bairro"
                  density="comfortable"
                  hide-details="auto"
                  label="Bairro"
                  prepend-inner-icon="mdi-home-group"
                  :rules="[rules.required]"
                  variant="outlined"
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
                  :rules="[rules.required]"
                  variant="outlined"
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
                  :rules="[rules.required, rules.minLength]"
                  :type="showNewPassword ? 'text' : 'password'"
                  variant="outlined"
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
                  :rules="[rules.required, rules.newPasswordMatch]"
                  :type="showNewConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
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
  import type { BackendUser, Contact, Municipality, State, User, UserRole } from '@/interfaces'
  import { defineComponent } from 'vue'
  import { useUnauthorized } from '@/composables/useUnauthorized'
  import { ContactService, MunicipalityService, UserService } from '@/services'
  import { useUsersCacheStore } from '@/stores/usersCache'
  import { useAuthStore } from '@/stores/auth'
  import { userRules } from '@/utils/rules'
  import { getRoleColor, getRoleIcon, mapBackendToUser, mapUserRoleToBackendRole } from '@/utils/tramposes/user'

  interface NewUserForm {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: UserRole | ''
    tipo_contato: string
    valor_contato: string
    codigo_pais: string
    id_uf: number | null
    id_municipio: number | null
    logradouro: string
    numero: string
    complemento: string
    bairro: string
  }

  interface TableHeader {
    title: string
    key: string
    sortable?: boolean
    width?: string
  }

  export default defineComponent({
    name: 'UserManagementPage',
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
        validForm: false as boolean,
        changePassword: false as boolean,
        newPassword: '' as string,
        confirmPassword: '' as string,
        showPassword: false as boolean,
        showConfirmPassword: false as boolean,
        createDialog: false as boolean,
        newUser: {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '' as UserRole | '',
          tipo_contato: '',
          valor_contato: '',
          codigo_pais: '+55',
          id_uf: null as number | null,
          id_municipio: null as number | null,
          logradouro: '',
          numero: '',
          complemento: '',
          cep: '',
          bairro: '',
        } as NewUserForm,
        showNewPassword: false as boolean,
        showNewConfirmPassword: false as boolean,
        validCreateForm: false as boolean,
        ufs: [] as State[],
        municipios: [] as Municipality[],
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
      rules () {
        return {
          required: userRules.required,
          email: userRules.email,
          minLength: userRules.minLength(6),
          passwordMatch: (v: string): boolean | string => userRules.passwordMatch({ value: this.newPassword })(v),
          newPasswordMatch: (v: string): boolean | string => userRules.passwordMatch({ value: this.newUser.password })(v),
        }
      },
      activeUsersCount () {
        return this.users.filter(u => u.status === 'active').length
      },
      adminCount () {
        return this.users.filter(u => u.role === 'Admin').length
      },
      filteredUsers (): User[] {
        return this.users.filter(user => {
          const roleMatch = this.filterRole === 'Todos' || user.role === this.filterRole
          const statusMatch = this.filterStatus === 'Todos' || user.status === this.filterStatus
          return roleMatch && statusMatch
        })
      },
      ufOptions () {
        return this.ufs.map((uf: State) => ({
          label: `${uf.sigla} - ${uf.nome}`,
          value: uf.id,
        }))
      },
      municipioOptions () {
        return this.municipios.map((municipio: Municipality) => ({
          label: municipio.nome,
          value: municipio.id,
        }))
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
      async loadMunicipios (ufId: number) {
        try {
          this.municipios = await MunicipalityService.getByUf(ufId)
        } catch (error) {
          console.error('Erro ao carregar munic�pios:', error)
        }
      },
      onUfChange (ufId: number) {
        this.newUser.id_municipio = null
        if (ufId) {
          this.loadMunicipios(ufId)
        } else {
          this.municipios = []
        }
      },
      getContactMask (tipoContato: string): string {
        switch (tipoContato) {
          case 'telefone':
          case 'whatsapp': {
            return '(##) #####-####'
          }
          case 'email': {
            return ''
          }
          case 'instagram':
          case 'telegram': {
            return ''
          }
          default: {
            return ''
          }
        }
      },
      formatContactValue (event: Event) {
        const target = event.target as HTMLInputElement
        const value = target.value
        const tipoContato = this.newUser.tipo_contato

        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const numbers = value.replace(/\D/g, '')
          const limitedNumbers = numbers.slice(0, 11)

          if (limitedNumbers.length <= 2) {
            this.newUser.valor_contato = limitedNumbers
          } else if (limitedNumbers.length <= 6) {
            this.newUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
          } else if (limitedNumbers.length <= 10) {
            this.newUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
          } else {
            this.newUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
          }
        } else {
          this.newUser.valor_contato = value.slice(0, 100)
        }
      },
      onContactKeypress (event: KeyboardEvent) {
        const tipoContato = this.newUser.tipo_contato
        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const char = String.fromCodePoint(event.which)
          if (!/[0-9]/.test(char)) {
            event.preventDefault()
          }
        }
      },
      async fetchUsers (forceRefresh = false) {
        // Verifica se já tem dados no cache
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
          this.snackbarText = 'Usuários carregados com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
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
        this.changePassword = false
        this.newPassword = ''
        this.confirmPassword = ''
        this.editDialog = true
      },
      cancelEdit () {
        this.editDialog = false
        this.editingUser = null
        this.changePassword = false
        this.newPassword = ''
        this.confirmPassword = ''
      },
      async saveUser () {
        if (!this.editingUser) return
        this.saving = true
        try {
          const payload: Partial<BackendUser> = {
            nome: this.editingUser.name || this.editingUser.nome || '',
            email: this.editingUser.email,
            role: mapUserRoleToBackendRole(this.editingUser.role || 'Visualizador'),
            ativo: this.editingUser.status !== 'inactive',
          }
          if (this.changePassword && this.newPassword) {
            payload.senha = this.newPassword
          }
          await UserService.update(this.editingUser.id, payload)
          this.snackbarText = 'Usuário atualizado com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.editDialog = false
          this.editingUser = null
          this.changePassword = false
          this.newPassword = ''
          this.confirmPassword = ''
          // Invalida cache e força refresh após criar/atualizar/remover
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
          // Invalida cache e força refresh após criar/atualizar/remover
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
        this.goToRegistration()
      },
      goToRegistration () {
        this.newUser = {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          tipo_contato: '',
          valor_contato: '',
          codigo_pais: '+55',
          id_uf: null,
          id_municipio: null,
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
        }
        this.createDialog = true
      },
      cancelCreate () {
        this.createDialog = false
        this.newUser = {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          tipo_contato: '',
          valor_contato: '',
          codigo_pais: '+55',
          id_uf: null,
          id_municipio: null,
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
        }
      },
      async createUser () {
        this.saving = true
        try {
          const emailExists = await UserService.emailExists(this.newUser.email)
          if (emailExists) {
            this.snackbarText = 'Este e-mail já está cadastrado'
            this.snackbarColor = 'error'
            this.snackbar = true
            return
          }

          let contactId: number | undefined
          if (this.newUser.tipo_contato && this.newUser.valor_contato) {
            const contact = await ContactService.create({
              nome: this.newUser.name,
              valor: this.newUser.valor_contato,
              tipo_contato: this.newUser.tipo_contato as Contact['tipo_contato'],
              codigo_pais: this.newUser.codigo_pais || null,
            })
            contactId = contact.id
          }

          const createdUser = await UserService.create({
            nome: this.newUser.name,
            email: this.newUser.email,
            senha: this.newUser.password,
            role: mapUserRoleToBackendRole(this.newUser.role || 'Visualizador'),
            id_contato: contactId,
            id_uf: this.newUser.id_uf ?? undefined,
            ativo: true,
          })

          this.users.push(mapBackendToUser(createdUser, this.users.length))

          this.snackbarText = 'Usuário criado com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.createDialog = false
          this.newUser = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            tipo_contato: '',
            valor_contato: '',
            codigo_pais: '+55',
            id_uf: null,
            id_municipio: null,
            logradouro: '',
            numero: '',
            complemento: '',
            cep: '',
            bairro: '',
          }
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
