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

<script lang="ts">
  import type { UserRole, ValidationRule } from '@/interfaces'
  import { UserService } from '@/services'
  import { getStoredUser, setStoredUser } from '@/services/auth.storage'
  import { useAuthStore } from '@/stores/auth'
  import { userRules } from '@/utils/rules'
  import { getInitials as getInitialsFromUtils, getRoleColor as getRoleColorFromUtils, getRoleIcon as getRoleIconFromUtils, mapBackendRoleToUserRole } from '@/utils/tramposes/user'

  interface UserProfile {
    id: number
    name: string
    email: string
    role: UserRole
    memberSince: string
    lastAccess: string
    initials: string
    avatarColor: string
  }

  interface EditData {
    name: string
    email: string
  }

  interface PasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }

  interface FormRules {
    required: ValidationRule
    email: ValidationRule
    minLength: ValidationRule
    passwordMatch: ValidationRule
  }

  export default {
    name: 'ProfilePage',
    data () {
      return {
        tab: 'info',
        validEdit: false,
        validPassword: false,
        saving: false,
        savingPassword: false,
        deleteDialog: false,
        snackbar: false,
        snackbarText: '',
        snackbarColor: 'success',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
        userProfile: {
          id: 1,
          name: 'Administrador',
          email: 'admin@sistema.com',
          role: 'Admin' as UserRole,
          memberSince: '01/01/2024',
          lastAccess: new Date().toLocaleString('pt-BR'),
          initials: 'AD',
          avatarColor: 'primary',
        } as UserProfile,
        editData: {
          name: '',
          email: '',
        } as EditData,
        passwordData: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        } as PasswordData,

      }
    },
    computed: {
      rules (): FormRules {
        const self = this as unknown as { passwordData: PasswordData }
        return {
          required: userRules.required,
          email: userRules.email,
          minLength: userRules.minLength(6),
          passwordMatch: userRules.passwordMatch({ value: self.passwordData.newPassword }),
        }
      },
    },
    async mounted () {
      await this.loadUserProfile()
    },
    methods: {
      getInitials (name: string): string {
        return getInitialsFromUtils(name)
      },
      getRoleColor (role: UserRole): string {
        return getRoleColorFromUtils(role)
      },
      getRoleIcon (role: UserRole): string {
        return getRoleIconFromUtils(role)
      },
      async loadUserProfile (): Promise<void> {
        try {
          const storedUser = getStoredUser()
          if (!storedUser?.id) {
            throw new Error('Usuário não autenticado')
          }

          const backendUser = await UserService.getById(storedUser.id)

          this.userProfile = {
            id: backendUser.id,
            name: backendUser.nome,
            email: backendUser.email,
            role: mapBackendRoleToUserRole(backendUser.role),
            memberSince: new Date().toLocaleDateString('pt-BR'),
            lastAccess: new Date().toLocaleString('pt-BR'),
            initials: this.getInitials(backendUser.nome),
            avatarColor: 'primary',
          }

          this.editData = {
            name: backendUser.nome,
            email: backendUser.email,
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error)
          this.snackbarText = 'Erro ao carregar perfil'
          this.snackbarColor = 'error'
          this.snackbar = true
          this.$router.push('/login')
        }
      },
      cancelEdit (): void {
        this.editData = {
          name: this.userProfile.name,
          email: this.userProfile.email,
        }
        this.tab = 'info'
      },

      async saveProfile (): Promise<void> {
        this.saving = true
        try {
          const updatedUser = await UserService.update(this.userProfile.id, {
            nome: this.editData.name,
            email: this.editData.email,
          })

          this.userProfile.name = updatedUser.nome
          this.userProfile.email = updatedUser.email
          this.userProfile.initials = this.getInitials(updatedUser.nome)
          this.editData = {
            name: updatedUser.nome,
            email: updatedUser.email,
          }
          setStoredUser(updatedUser)

          this.snackbarText = 'Perfil atualizado com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.tab = 'info'
        } catch (error) {
          console.error('Erro ao salvar perfil:', error)
          this.snackbarText = 'Erro ao atualizar perfil'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.saving = false
        }
      },

      async changePassword (): Promise<void> {
        this.savingPassword = true
        try {
          await UserService.update(this.userProfile.id, {
            senha: this.passwordData.newPassword,
          })

          this.snackbarText = 'Senha alterada com sucesso!'
          this.snackbarColor = 'success'
          this.snackbar = true
          this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }
        } catch (error) {
          console.error('Erro ao alterar senha:', error)
          this.snackbarText = 'Erro ao alterar senha'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.savingPassword = false
        }
      },

      async confirmDeleteAccount (): Promise<void> {
        try {
          await UserService.delete(this.userProfile.id)
          const authStore = useAuthStore()
          authStore.logout()
          this.snackbarText = 'Conta excluída com sucesso'
          this.snackbarColor = 'success'
          this.snackbar = true
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        } catch (error) {
          console.error('Erro ao excluir conta:', error)
          this.snackbarText = 'Erro ao excluir conta'
          this.snackbarColor = 'error'
          this.snackbar = true
        } finally {
          this.deleteDialog = false
        }
      },
      goBack (): void {
        this.$router.back()
      },

    },
  }
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
