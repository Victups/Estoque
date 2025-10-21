<template>
  <div class="login-page">
    <v-container class="fill-height pa-0" fluid>
      <v-row class="fill-height" no-gutters>
        <!-- Left Side - Branding -->
        <v-col class="d-none d-md-flex" cols="12" md="6">
          <div class="branding-section">
            <div class="branding-content">
              <v-icon class="mb-6" color="white" size="80">mdi-package-variant</v-icon>
              <h1 class="text-h2 font-weight-bold text-white mb-4">
                Estoque
              </h1>
              <p class="text-h6 text-white opacity-90">
                Gerencie seu inventário com eficiência e simplicidade
              </p>
            </div>
          </div>
        </v-col>

        <!-- Right Side - Login Form -->
        <v-col class="d-flex align-center justify-center" cols="12" md="6">
          <div class="login-form-wrapper">
            <v-card class="pa-8" flat max-width="450" width="100%">
              <div class="text-center mb-8">
                <h2 class="text-h4 font-weight-bold mb-2">
                  Bem-vindo
                </h2>
                <p class="text-body-1 text-medium-emphasis">
                  Entre com suas credenciais
                </p>
              </div>

              <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  class="mb-4"
                  color="primary"
                  label="E-mail"
                  prepend-inner-icon="mdi-email"
                  required
                  :rules="emailRules"
                  type="email"
                  variant="outlined"
                />

                <v-text-field
                  v-model="password"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  class="mb-2"
                  color="primary"
                  label="Senha"
                  prepend-inner-icon="mdi-lock"
                  required
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-select
                  v-model="selectedUfId"
                  class="mb-4"
                  color="primary"
                  :item-title="'label'"
                  :item-value="'id'"
                  :items="ufOptions"
                  label="UF"
                  prepend-inner-icon="mdi-map"
                  required
                  :rules="[v => !!v || 'UF é obrigatória']"
                  variant="outlined"
                />

                <v-row class="mb-4">
                  <v-col cols="6">
                    <v-checkbox
                      v-model="rememberMe"
                      color="primary"
                      density="compact"
                      hide-details
                      label="Lembrar-me"
                    />
                  </v-col>
                  <v-col class="text-right d-flex align-center justify-end" cols="6">
                    <v-btn
                      color="primary"
                      size="small"
                      variant="text"
                      @click="handleForgotPassword"
                    >
                      Esqueceu a senha?
                    </v-btn>
                  </v-col>
                </v-row>

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

                <v-btn
                  block
                  class="mb-4"
                  color="primary"
                  :disabled="!valid"
                  :loading="loading"
                  size="large"
                  type="submit"
                >
                  Entrar
                </v-btn>
              </v-form>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import type { State } from '../types'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { AuthService, UfService } from '@/services'
  import { useAuthStore } from '../stores/auth'

  const router = useRouter()

  // Form state
  const formRef = ref()
  const valid = ref(false)
  const email = ref('')
  const password = ref('')
  const selectedUfId = ref<number | null>(null)
  const rememberMe = ref(false)
  const showPassword = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // UF Options (carregadas do backend)
  const ufs = ref<State[]>([])
  const ufOptions = computed(() =>
    ufs.value.map(uf => ({
      id: uf.id,
      label: `${uf.sigla} - ${uf.nome}`,
    })),
  )

  // Carregar UFs ao montar o componente
  onMounted(async () => {
    try {
      ufs.value = await UfService.getAll()
    } catch (error_) {
      console.error('Erro ao carregar UFs:', error_)
      error.value = 'Erro ao carregar estados. Tente novamente.'
    }
  })

  // Validation rules
  const emailRules = [
    (v: string) => !!v || 'E-mail é obrigatório',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
  ]

  const passwordRules = [
    (v: string) => !!v || 'Senha é obrigatória',
    (v: string) => v.length >= 6 || 'Senha deve ter no mínimo 6 caracteres',
  ]

  // Functions
  async function handleLogin () {
    if (!valid.value || !selectedUfId.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // Validar credenciais contra o backend
      const user = await AuthService.login(email.value, password.value)

      if (!user) {
        error.value = 'E-mail ou senha inválidos'
        return
      }

      // Buscar informações da UF selecionada
      const ufData = ufs.value.find(u => u.id === selectedUfId.value)
      const ufLabel = ufData ? `${ufData.sigla} - ${ufData.nome}` : ''

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('userEmail', email.value)
      }

      // Salvar sessão no store de autenticação
      const auth = useAuthStore()
      auth.setAuth({
        name: user.nome,
        email: user.email,
        ufId: selectedUfId.value,
        ufLabel,
      })

      // Redirecionar para dashboard
      router.push('/')
    } catch (error_) {
      error.value = 'Erro ao fazer login. Verifique suas credenciais e tente novamente.'
      console.error('Erro no login:', error_)
    } finally {
      loading.value = false
    }
  }

  function handleForgotPassword () {
    // Implementar recuperação de senha
    console.log('Recuperação de senha')
    // router.push('/recuperar-senha')
  }
</script>

<route lang="yaml">
meta:
  layout: blank
</route>

<style scoped>
.login-page {
  width: 100%;
  height: 100%;
}

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
  max-width: 500px;
}

.login-form-wrapper {
  width: 100%;
  padding: 2rem;
}

.opacity-90 {
  opacity: 0.9;
}
</style>
