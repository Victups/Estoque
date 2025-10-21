<template>
  <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.name"
          density="comfortable"
          hide-details="auto"
          label="Nome Completo"
          prepend-inner-icon="mdi-account"
          :rules="nameRules"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.email"
          density="comfortable"
          hide-details="auto"
          label="Email"
          prepend-inner-icon="mdi-email"
          :rules="emailRules"
          type="email"
          variant="outlined"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="formData.role"
          density="comfortable"
          hide-details="auto"
          :items="roleOptions"
          label="Função"
          prepend-inner-icon="mdi-shield-account"
          :rules="roleRules"
          variant="outlined"
        />
      </v-col>

      <v-col v-if="mode === 'create'" cols="12" md="6">
        <v-text-field
          v-model="formData.password"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          density="comfortable"
          hide-details="auto"
          label="Senha"
          prepend-inner-icon="mdi-lock"
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>

      <v-col v-if="mode === 'create'" cols="12" md="6">
        <v-text-field
          v-model="formData.confirmPassword"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
          density="comfortable"
          hide-details="auto"
          label="Confirmar Senha"
          prepend-inner-icon="mdi-lock-check"
          :rules="confirmPasswordRules"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />
      </v-col>

      <v-col cols="12">
        <div class="d-flex justify-end gap-3">
          <v-btn
            color="grey"
            variant="outlined"
            @click="emit('cancel')"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            :loading="loading"
            type="submit"
            variant="elevated"
          >
            {{ mode === 'create' ? 'Criar' : 'Atualizar' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
  import type { User, UserRole, ValidationRule } from '@/types'
  import { ref, watch } from 'vue'
  import { useFormValidation } from '@/composables/useFormValidation'

  interface UserFormData {
    name: string
    email: string
    role: UserRole | null
    password?: string
    confirmPassword?: string
  }

  interface Props {
    user?: User | null
    mode: 'create' | 'edit'
    loading?: boolean
  }

  interface Emits {
    (event: 'submit', data: UserFormData): void
    (event: 'cancel'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    user: null,
    loading: false,
  })

  const emit = defineEmits<Emits>()

  const validation = useFormValidation()

  interface VForm {
    validate: () => Promise<{ valid: boolean }>
    reset: () => void
  }

  const formRef = ref<VForm | null>(null)
  const valid = ref<boolean>(false)
  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)

  const formData = ref<UserFormData>({
    name: '',
    email: '',
    role: null,
    password: '',
    confirmPassword: '',
  })

  const roleOptions: UserRole[] = ['Admin', 'Gerente', 'Operador', 'Visualizador']

  const nameRules: ValidationRule[] = [
    validation.required,
    validation.minLength(3),
  ]

  const emailRules: ValidationRule[] = [
    validation.required,
    validation.email,
  ]

  const roleRules: ValidationRule[] = [
    validation.required,
  ]

  const passwordRules: ValidationRule[] = props.mode === 'create'
    ? [validation.required, validation.minLength(6)]
    : []

  const confirmPasswordRules: ValidationRule[] = props.mode === 'create'
    ? [validation.required, validation.passwordMatch(formData.value.password ? { value: formData.value.password } : { value: '' })]
    : []

  function handleSubmit (): void {
    emit('submit', formData.value)
  }

  // Watch para preencher o formulário quando user prop mudar
  watch(
    () => props.user,
    (newUser: User | null | undefined) => {
      formData.value = newUser
        ? {
          name: newUser.name || newUser.nome,
          email: newUser.email,
          role: newUser.role,
        }
        : {
          name: '',
          email: '',
          role: null,
          password: '',
          confirmPassword: '',
        }
    },
    { immediate: true },
  )
</script>

<style scoped>
.gap-3 {
  gap: 1rem;
}
</style>
