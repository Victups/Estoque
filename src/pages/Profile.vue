<template>
  <div class="profile-page">
    <v-container class="pa-6" fluid>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-btn
            color="grey-darken-1"
            prepend-icon="mdi-arrow-left"
            variant="text"
            @click="goBack"
          >
            Voltar
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <!-- Left Column - Profile Card -->
        <v-col cols="12" md="4">
          <v-card class="profile-card" elevation="8">
            <v-card-text class="text-center pa-8">
              <v-avatar class="mb-4" :color="userProfile.avatarColor" size="150">
                <span class="text-h2 text-white font-weight-bold">
                  {{ userProfile.initials }}
                </span>
              </v-avatar>

              <h1 class="text-h4 font-weight-bold mb-2">
                {{ userProfile.name }}
              </h1>
              <p class="text-h6 text-grey mb-4">
                {{ userProfile.email }}
              </p>

              <v-chip
                class="mb-4"
                :color="getRoleColor(userProfile.role)"
                size="large"
                variant="flat"
              >
                <v-icon class="mr-2" :icon="getRoleIcon(userProfile.role)" />
                {{ userProfile.role }}
              </v-chip>

              <v-divider class="my-6" />

              <v-list class="bg-transparent">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary" icon="mdi-office-building" />
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    Departamento
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ userProfile.department }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="success" icon="mdi-calendar-check" />
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    Membro desde
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ userProfile.memberSince }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="info" icon="mdi-clock-outline" />
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    Último acesso
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ userProfile.lastAccess }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Stats Card -->
          <v-card class="mt-4" elevation="8">
            <v-card-title class="bg-gradient">
              <v-icon class="mr-2" icon="mdi-chart-box" />
              Estatísticas
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="6">
                  <div class="text-center">
                    <v-icon color="primary" icon="mdi-package-variant" size="40" />
                    <h3 class="text-h4 font-weight-bold mt-2">42</h3>
                    <p class="text-caption text-grey">Produtos</p>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-center">
                    <v-icon color="success" icon="mdi-check-circle" size="40" />
                    <h3 class="text-h4 font-weight-bold mt-2">98%</h3>
                    <p class="text-caption text-grey">Taxa de Sucesso</p>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Tabs -->
        <v-col cols="12" md="8">
          <v-card elevation="8">
            <v-tabs v-model="tab" bg-color="primary" class="tabs-header">
              <v-tab value="info">
                <v-icon class="mr-2" icon="mdi-information" />
                Informações
              </v-tab>
              <v-tab value="edit">
                <v-icon class="mr-2" icon="mdi-pencil" />
                Editar Perfil
              </v-tab>
              <v-tab value="security">
                <v-icon class="mr-2" icon="mdi-shield-lock" />
                Segurança
              </v-tab>
            </v-tabs>

            <v-window v-model="tab">
              <!-- Tab 1: Informações -->
              <v-window-item value="info">
                <v-card-text class="pa-8">
                  <h2 class="text-h5 font-weight-bold mb-6">
                    <v-icon class="mr-2" icon="mdi-account-details" />
                    Informações Pessoais
                  </h2>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card class="info-card" elevation="2" variant="outlined">
                        <v-card-text>
                          <div class="d-flex align-center mb-2">
                            <v-icon class="mr-3" color="primary" icon="mdi-account" />
                            <span class="text-caption text-grey">Nome Completo</span>
                          </div>
                          <h3 class="text-h6 ml-9">{{ userProfile.name }}</h3>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card class="info-card" elevation="2" variant="outlined">
                        <v-card-text>
                          <div class="d-flex align-center mb-2">
                            <v-icon class="mr-3" color="primary" icon="mdi-email" />
                            <span class="text-caption text-grey">Email</span>
                          </div>
                          <h3 class="text-h6 ml-9">{{ userProfile.email }}</h3>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card class="info-card" elevation="2" variant="outlined">
                        <v-card-text>
                          <div class="d-flex align-center mb-2">
                            <v-icon class="mr-3" color="primary" icon="mdi-shield-account" />
                            <span class="text-caption text-grey">Função</span>
                          </div>
                          <h3 class="text-h6 ml-9">{{ userProfile.role }}</h3>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card class="info-card" elevation="2" variant="outlined">
                        <v-card-text>
                          <div class="d-flex align-center mb-2">
                            <v-icon class="mr-3" color="primary" icon="mdi-office-building" />
                            <span class="text-caption text-grey">Departamento</span>
                          </div>
                          <h3 class="text-h6 ml-9">{{ userProfile.department }}</h3>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12">
                      <v-card class="info-card" elevation="2" variant="outlined">
                        <v-card-text>
                          <div class="d-flex align-center mb-2">
                            <v-icon class="mr-3" color="primary" icon="mdi-information" />
                            <span class="text-caption text-grey">Status da Conta</span>
                          </div>
                          <div class="ml-9">
                            <v-chip color="success" size="small" variant="flat">
                              <v-icon class="mr-1" icon="mdi-check-circle" size="small" />
                              Conta Ativa
                            </v-chip>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-window-item>

              <!-- Tab 2: Editar Perfil -->
              <v-window-item value="edit">
                <v-card-text class="pa-8">
                  <h2 class="text-h5 font-weight-bold mb-6">
                    <v-icon class="mr-2" icon="mdi-pencil" />
                    Editar Perfil
                  </h2>

                  <v-form ref="editForm" v-model="validEdit">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="editData.name"
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
                          v-model="editData.email"
                          density="comfortable"
                          hide-details="auto"
                          label="Email"
                          prepend-inner-icon="mdi-email"
                          :rules="[rules.required, rules.email]"
                          type="email"
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="editData.department"
                          density="comfortable"
                          hide-details="auto"
                          :items="['TI', 'Gestão', 'Estoque', 'Vendas', 'Financeiro', 'Geral']"
                          label="Departamento"
                          prepend-inner-icon="mdi-office-building"
                          :rules="[rules.required]"
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12">
                        <div class="d-flex justify-end gap-3">
                          <v-btn
                            color="grey"
                            variant="outlined"
                            @click="cancelEdit"
                          >
                            Cancelar
                          </v-btn>
                          <v-btn
                            color="primary"
                            :disabled="!validEdit"
                            :loading="saving"
                            variant="elevated"
                            @click="saveProfile"
                          >
                            <v-icon class="mr-2" icon="mdi-content-save" />
                            Salvar Alterações
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-window-item>

              <!-- Tab 3: Segurança -->
              <v-window-item value="security">
                <v-card-text class="pa-8">
                  <h2 class="text-h5 font-weight-bold mb-6">
                    <v-icon class="mr-2" icon="mdi-shield-lock" />
                    Alterar Senha
                  </h2>

                  <v-alert
                    class="mb-6"
                    color="info"
                    icon="mdi-information"
                    variant="tonal"
                  >
                    Sua senha deve ter no mínimo 6 caracteres
                  </v-alert>

                  <v-form ref="passwordForm" v-model="validPassword">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="passwordData.currentPassword"
                          :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          density="comfortable"
                          hide-details="auto"
                          label="Senha Atual"
                          prepend-inner-icon="mdi-lock"
                          :rules="[rules.required]"
                          :type="showCurrentPassword ? 'text' : 'password'"
                          variant="outlined"
                          @click:append-inner="showCurrentPassword = !showCurrentPassword"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="passwordData.newPassword"
                          :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          density="comfortable"
                          hide-details="auto"
                          label="Nova Senha"
                          prepend-inner-icon="mdi-lock-plus"
                          :rules="[rules.required, rules.minLength]"
                          :type="showNewPassword ? 'text' : 'password'"
                          variant="outlined"
                          @click:append-inner="showNewPassword = !showNewPassword"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="passwordData.confirmPassword"
                          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          density="comfortable"
                          hide-details="auto"
                          label="Confirmar Nova Senha"
                          prepend-inner-icon="mdi-lock-check"
                          :rules="[rules.required, rules.passwordMatch]"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          variant="outlined"
                          @click:append-inner="showConfirmPassword = !showConfirmPassword"
                        />
                      </v-col>

                      <v-col cols="12">
                        <div class="d-flex justify-end">
                          <v-btn
                            color="primary"
                            :disabled="!validPassword"
                            :loading="savingPassword"
                            size="large"
                            variant="elevated"
                            @click="changePassword"
                          >
                            <v-icon class="mr-2" icon="mdi-lock-reset" />
                            Alterar Senha
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-form>

                  <v-divider class="my-8" />

                  <h3 class="text-h6 font-weight-bold mb-4">
                    <v-icon class="mr-2" color="error" icon="mdi-delete-forever" />
                    Zona de Perigo
                  </h3>

                  <v-card color="error-lighten-5" variant="outlined">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <h4 class="font-weight-bold mb-1">Excluir Conta</h4>
                          <p class="text-body-2 text-grey-darken-1">
                            Esta ação é permanente e não pode ser desfeita
                          </p>
                        </div>
                        <v-btn
                          color="error"
                          variant="outlined"
                          @click="deleteDialog = true"
                        >
                          <v-icon class="mr-2" icon="mdi-delete" />
                          Excluir Conta
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Account Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-error pa-4 text-white">
          <v-icon class="mr-2" icon="mdi-alert-octagon" />
          Confirmar Exclusão da Conta
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon color="error" icon="mdi-delete-alert" size="80" />
          </div>
          <p class="text-h6 text-center mb-4">
            Tem certeza que deseja excluir sua conta?
          </p>
          <p class="text-center text-grey">
            Esta ação é <strong>irreversível</strong> e todos os seus dados serão permanentemente removidos.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="elevated" @click="confirmDeleteAccount">
            <v-icon class="mr-2" icon="mdi-delete" />
            Sim, Excluir Conta
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
          :icon="snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
        />
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import type { BackendUser, Department, UserRole, ValidationRule } from '@/types'
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  interface UserProfile {
    id: number
    name: string
    email: string
    role: UserRole
    department: string
    memberSince: string
    lastAccess: string
    initials: string
    avatarColor: string
  }

  interface EditData {
    name: string
    email: string
    department: string
  }

  interface PasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }

  const tab = ref('info')
  const validEdit = ref(false)
  const validPassword = ref(false)
  const saving = ref(false)
  const savingPassword = ref(false)
  const deleteDialog = ref(false)
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')

  const showCurrentPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  const userProfile = ref<UserProfile>({
    id: 1,
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'Admin',
    department: 'TI',
    memberSince: '01/01/2024',
    lastAccess: new Date().toLocaleString('pt-BR'),
    initials: 'AD',
    avatarColor: 'primary',
  })

  const editData = ref<EditData>({
    name: '',
    email: '',
    department: 'TI',
  })

  const passwordData = ref<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  interface FormRules {
    required: ValidationRule
    email: ValidationRule
    minLength: ValidationRule
    passwordMatch: ValidationRule
  }

  const rules: FormRules = {
    required: (v: string): boolean | string => !!v || 'Campo obrigatório',
    email: (v: string): boolean | string => /.+@.+\..+/.test(v) || 'Email inválido',
    minLength: (v: string): boolean | string => (v && v.length >= 6) || 'Mínimo de 6 caracteres',
    passwordMatch: (v: string): boolean | string =>
      v === passwordData.value.newPassword || 'As senhas não coincidem',
  }

  function getInitials (name: string): string {
    const names = name.split(' ')
    if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
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

  async function loadUserProfile (): Promise<void> {
    try {
      // Buscar todos os usuários
      const response = await fetch('http://localhost:3001/usuarios')
      if (!response.ok) {
        throw new Error('Erro ao carregar perfil')
      }

      const data: unknown = await response.json()

      // O db.json retorna array aninhado [[...]], então pegamos o primeiro elemento
      const usuariosArray: BackendUser[] = Array.isArray(data) && Array.isArray(data[0])
        ? data[0]
        : (Array.isArray(data) ? data : [])

      // Pegar o primeiro usuário (Admin)
      const userData: BackendUser | undefined = usuariosArray[0]

      if (!userData) {
        throw new Error('Usuário não encontrado')
      }

      userProfile.value = {
        id: userData.id,
        name: userData.nome,
        email: userData.email,
        role: 'Admin',
        department: 'TI',
        memberSince: '01/01/2024',
        lastAccess: new Date().toLocaleString('pt-BR'),
        initials: getInitials(userData.nome),
        avatarColor: 'primary',
      }

      // Preencher dados de edição
      editData.value = {
        name: userProfile.value.name,
        email: userProfile.value.email,
        department: userProfile.value.department,
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar perfil:', error)
      snackbarText.value = 'Erro ao carregar perfil. Verifique se o backend está rodando.'
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  }

  function cancelEdit (): void {
    editData.value = {
      name: userProfile.value.name,
      email: userProfile.value.email,
      department: userProfile.value.department,
    }
    tab.value = 'info'
  }

  async function saveProfile (): Promise<void> {
    saving.value = true
    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : (Array.isArray(allData) ? allData : [])

      // Atualizar o usuário específico no array
      const userIndex = usuariosArray.findIndex((u: BackendUser) => u.id === userProfile.value.id)
      if (userIndex !== -1) {
        const currentUser = usuariosArray[userIndex]
        if (currentUser) {
          usuariosArray[userIndex] = {
            ...currentUser,
            nome: editData.value.name,
            email: editData.value.email,
          }
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
        throw new Error('Erro ao atualizar perfil')
      }

      userProfile.value.name = editData.value.name
      userProfile.value.email = editData.value.email
      userProfile.value.department = editData.value.department
      userProfile.value.initials = getInitials(editData.value.name)

      snackbarText.value = 'Perfil atualizado com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true
      tab.value = 'info'
    } catch (error: unknown) {
      console.error('Erro ao salvar perfil:', error)
      snackbarText.value = 'Erro ao atualizar perfil'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      saving.value = false
    }
  }

  async function changePassword (): Promise<void> {
    savingPassword.value = true
    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : (Array.isArray(allData) ? allData : [])

      // Atualizar a senha do usuário específico no array
      const userIndex = usuariosArray.findIndex((u: BackendUser) => u.id === userProfile.value.id)
      if (userIndex !== -1) {
        const currentUser = usuariosArray[userIndex]
        if (currentUser) {
          usuariosArray[userIndex] = {
            ...currentUser,
            senha: passwordData.value.newPassword,
          }
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
        throw new Error('Erro ao alterar senha')
      }

      snackbarText.value = 'Senha alterada com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true

      // Limpar formulário
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    } catch (error: unknown) {
      console.error('Erro ao alterar senha:', error)
      snackbarText.value = 'Erro ao alterar senha'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      savingPassword.value = false
    }
  }

  async function confirmDeleteAccount (): Promise<void> {
    try {
      // Buscar todos os usuários
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : (Array.isArray(allData) ? allData : [])

      // Remover o usuário do array
      const updatedArray = usuariosArray.filter((u: BackendUser) => u.id !== userProfile.value.id)

      // Salvar o array atualizado
      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([updatedArray]),
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir conta')
      }

      snackbarText.value = 'Conta excluída com sucesso'
      snackbarColor.value = 'success'
      snackbar.value = true

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: unknown) {
      console.error('Erro ao excluir conta:', error)
      snackbarText.value = 'Erro ao excluir conta'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      deleteDialog.value = false
    }
  }

  function goBack (): void {
    router.back()
  }

  onMounted(() => {
    loadUserProfile()
  })
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #000000;
}

.profile-card {
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
}

.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tabs-header {
  border-radius: 12px 12px 0 0;
}

.bg-gradient {
  background: #1a1a1a;
  color: white;
}

:deep(.v-tab) {
  color: white;
}

:deep(.v-tab--selected) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
