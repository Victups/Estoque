<template>
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height" no-gutters>
      <!-- Left Side - Branding -->
      <v-col class="d-none d-lg-flex" cols="12" lg="5">
        <div class="branding-section">
          <div class="branding-content">
            <v-icon class="mb-6" color="white" size="120">
              mdi-warehouse
            </v-icon>
            <h1 class="text-h2 font-weight-bold text-white mb-4">
              Sistema de Estoque
            </h1>
            <p class="text-h5 text-white opacity-90 mb-8">
              Gerencie seu estoque com eficiência e praticidade
            </p>
            <v-row class="mt-8">
              <v-col cols="12">
                <div class="feature-item">
                  <v-icon color="white" size="30">mdi-check-circle</v-icon>
                  <span class="text-h6 text-white ml-3">Controle total de produtos</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="feature-item">
                  <v-icon color="white" size="30">mdi-chart-line</v-icon>
                  <span class="text-h6 text-white ml-3">Relatórios detalhados</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="feature-item">
                  <v-icon color="white" size="30">mdi-shield-check</v-icon>
                  <span class="text-h6 text-white ml-3">Segurança garantida</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>

      <!-- Right Side - Registration Form -->
      <v-col class="d-flex align-center justify-center" cols="12" lg="7">
        <div class="register-form-wrapper">
          <v-card class="pa-8 elevation-12" max-width="600" width="100%">
            <div class="text-center mb-6">
              <v-avatar class="mb-4" color="primary" size="80">
                <v-icon color="white" size="50">mdi-account-plus</v-icon>
              </v-avatar>
              <h2 class="text-h3 font-weight-bold mb-2">
                Criar Conta
              </h2>
              <p class="text-body-1 text-grey">
                Preencha os dados abaixo para se cadastrar
              </p>
            </div>

            <v-form ref="formRef" v-model="valid" @submit.prevent="handleRegister">
              <!-- Personal Information -->
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-account-circle</v-icon>
                  Informações Pessoais
                </h3>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="name"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      label="Nome completo"
                      prepend-inner-icon="mdi-account"
                      required
                      :rules="nameRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      label="E-mail"
                      prepend-inner-icon="mdi-email"
                      required
                      :rules="emailRules"
                      type="email"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-6" />

              <!-- Access Information -->
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-shield-lock</v-icon>
                  Informações de Acesso
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="password"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      label="Senha"
                      prepend-inner-icon="mdi-lock"
                      required
                      :rules="passwordRules"
                      :type="showPassword ? 'text' : 'password'"
                      variant="outlined"
                      @click:append-inner="showPassword = !showPassword"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="passwordConfirm"
                      :append-inner-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      label="Confirmar senha"
                      prepend-inner-icon="mdi-lock-check"
                      required
                      :rules="passwordConfirmRules"
                      :type="showPasswordConfirm ? 'text' : 'password'"
                      variant="outlined"
                      @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                    />
                  </v-col>
                </v-row>

                <v-alert
                  class="mt-3"
                  color="info"
                  icon="mdi-information"
                  variant="tonal"
                >
                  A senha deve ter no mínimo 6 caracteres
                </v-alert>
              </div>

              <v-divider class="my-6" />

              <!-- Additional Information -->
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold mb-3">
                  <v-icon class="mr-2">mdi-briefcase</v-icon>
                  Informações Profissionais
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="role"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      :items="['Operador', 'Visualizador', 'Gerente']"
                      label="Função"
                      prepend-inner-icon="mdi-shield-account"
                      required
                      :rules="roleRules"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="department"
                      color="primary"
                      density="comfortable"
                      hide-details="auto"
                      :items="['TI', 'Gestão', 'Estoque', 'Vendas', 'Financeiro', 'Geral']"
                      label="Departamento"
                      prepend-inner-icon="mdi-office-building"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </div>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                class="mb-4"
                closable
                type="error"
                variant="tonal"
                @click:close="error = null"
              >
                {{ error }}
              </v-alert>

              <!-- Terms and Conditions -->
              <v-checkbox
                v-model="acceptTerms"
                color="primary"
                hide-details="auto"
                :rules="termsRules"
              >
                <template #label>
                  <span class="text-body-2">
                    Eu aceito os
                    <a class="text-primary" href="#" @click.prevent>termos e condições</a>
                  </span>
                </template>
              </v-checkbox>

              <!-- Submit Button -->
              <v-btn
                block
                class="mt-6 mb-4"
                color="primary"
                :disabled="!valid"
                :loading="loading"
                size="x-large"
                type="submit"
              >
                <v-icon class="mr-2">mdi-account-plus</v-icon>
                Criar Conta
              </v-btn>

              <!-- Login Link -->
              <div class="text-center">
                <span class="text-body-2">Já tem uma conta?</span>
                <v-btn
                  color="primary"
                  size="small"
                  variant="text"
                  @click="goToLogin"
                >
                  Entrar agora
                  <v-icon class="ml-1" size="small">mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
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
          size="large"
        />
        <div>
          <div class="font-weight-bold">{{ snackbarText }}</div>
          <div v-if="snackbarColor === 'success'" class="text-caption">
            Redirecionando para o login...
          </div>
        </div>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { BackendUser, Department, UserRole, ValidationRule } from '@/types'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  interface VForm {
    validate: () => Promise<{ valid: boolean }>
    reset: () => void
  }

  const formRef = ref<VForm | null>(null)
  const valid = ref<boolean>(false)
  const name = ref<string>('')
  const email = ref<string>('')
  const password = ref<string>('')
  const passwordConfirm = ref<string>('')
  const role = ref<UserRole | ''>('')
  const department = ref<string>('Geral')
  const acceptTerms = ref<boolean>(false)
  const showPassword = ref<boolean>(false)
  const showPasswordConfirm = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const snackbar = ref<boolean>(false)
  const snackbarText = ref<string>('')
  const snackbarColor = ref<'success' | 'error'>('success')

  const nameRules: ValidationRule[] = [
    (v: string): boolean | string => !!v || 'Nome é obrigatório',
    (v: string): boolean | string => v.trim().length >= 3 || 'Informe pelo menos 3 caracteres',
  ]

  const emailRules: ValidationRule[] = [
    (v: string): boolean | string => !!v || 'E-mail é obrigatório',
    (v: string): boolean | string => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
  ]

  const passwordRules: ValidationRule[] = [
    (v: string): boolean | string => !!v || 'Senha é obrigatória',
    (v: string): boolean | string => v.length >= 6 || 'Senha deve ter pelo menos 6 caracteres',
  ]

  const passwordConfirmRules: ValidationRule[] = [
    (v: string): boolean | string => !!v || 'Confirmação é obrigatória',
    (v: string): boolean | string => v === password.value || 'As senhas não conferem',
  ]

  const roleRules: ValidationRule[] = [
    (v: string): boolean | string => !!v || 'Função é obrigatória',
  ]

  const termsRules: Array<(v: boolean) => boolean | string> = [
    (v: boolean): boolean | string => v || 'Você deve aceitar os termos e condições',
  ]

  async function handleRegister (): Promise<void> {
    if (!formRef.value) return

    const { valid: isValid } = await formRef.value.validate()
    if (!isValid) return

    loading.value = true
    error.value = null

    try {
      // Buscar todos os usuários existentes
      const getResponse = await fetch('http://localhost:3001/usuarios')
      const allData: unknown = await getResponse.json()
      const usuariosArray: BackendUser[] = Array.isArray(allData) && Array.isArray(allData[0])
        ? allData[0]
        : (Array.isArray(allData) ? allData : [])

      // Verificar se o email já existe
      const emailExists = usuariosArray.some((u: BackendUser) => u.email === email.value)
      if (emailExists) {
        error.value = 'Este e-mail já está cadastrado'
        loading.value = false
        return
      }

      // Gerar novo ID
      const newId: number = usuariosArray.length > 0
        ? Math.max(...usuariosArray.map((u: BackendUser) => u.id)) + 1
        : 1

      // Criar novo usuário
      const newUserData: BackendUser = {
        id: newId,
        nome: name.value,
        email: email.value,
        senha: password.value,
        id_contato: newId,
        role: 'estoquista',
      }

      usuariosArray.push(newUserData)

      const response = await fetch('http://localhost:3001/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([usuariosArray]),
      })

      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário')
      }

      snackbarText.value = 'Conta criada com sucesso!'
      snackbarColor.value = 'success'
      snackbar.value = true

      // Limpar formulário
      name.value = ''
      email.value = ''
      password.value = ''
      passwordConfirm.value = ''
      role.value = ''
      department.value = 'Geral'
      acceptTerms.value = false
      formRef.value.reset()

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error_: unknown) {
      console.error('Erro ao cadastrar:', error_)
      error.value = 'Erro ao cadastrar usuário. Tente novamente.'
      snackbarText.value = 'Erro ao cadastrar usuário'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      loading.value = false
    }
  }

  function goToLogin (): void {
    router.push('/login')
  }
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.branding-section {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.branding-content {
  text-align: center;
  max-width: 600px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background 0.3s ease;
}

.feature-item:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.15);
}

.register-form-wrapper {
  width: 100%;
  padding: 2rem;
  max-width: 650px;
  margin: 0 auto;
}

.opacity-90 {
  opacity: 0.9;
}

:deep(.v-card) {
  border-radius: 20px;
}

:deep(.v-input--density-comfortable) {
  --v-input-control-height: 48px;
}

@media (max-width: 960px) {
  .register-form-wrapper {
    padding: 1rem;
  }
}
</style>
