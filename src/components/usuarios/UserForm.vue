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
            @click="$emit('cancel')"
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

<script lang="ts">
  import type { User, UserRole, ValidationRule } from '@/interfaces'
  import { defineComponent } from 'vue'
  import { email, minLength, passwordMatch, required } from '@/utils/tramposes'

  interface UserFormData {
    name: string
    email: string
    role: UserRole | null
    password?: string
    confirmPassword?: string
  }

  interface VForm {
    validate: () => Promise<{ valid: boolean }>
    reset: () => void
  }

  export default defineComponent({
    name: 'UserForm',
    props: {
      user: {
        type: Object as () => User | null,
        default: null,
      },
      mode: {
        type: String as () => 'create' | 'edit',
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['submit', 'cancel'],
    data () {
      return {
        valid: false,
        showPassword: false,
        showConfirmPassword: false,
        formData: {
          name: '',
          email: '',
          role: null as UserRole | null,
          password: '',
          confirmPassword: '',
        } as UserFormData,
        formRef: null as VForm | null,
        roleOptions: ['Admin', 'Gerente', 'Operador', 'Visualizador'] as UserRole[],
      }
    },
    computed: {
      nameRules (): ValidationRule[] {
        return [
          required,
          minLength(3),
        ]
      },
      emailRules (): ValidationRule[] {
        return [
          required,
          email,
        ]
      },
      roleRules (): ValidationRule[] {
        return [
          required,
        ]
      },
      passwordRules (): ValidationRule[] {
        return this.mode === 'create'
          ? [required, minLength(6)]
          : []
      },
      confirmPasswordRules (): ValidationRule[] {
        return this.mode === 'create'
          ? [required, passwordMatch({ value: this.formData.password || '' })]
          : []
      },
    },
    watch: {
      user: {
        handler (newUser: User | null | undefined) {
          this.formData = newUser
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
        immediate: true,
      },
    },
    methods: {
      handleSubmit (): void {
        this.$emit('submit', this.formData)
      },
    },
  })
</script>

<style scoped>
.gap-3 {
  gap: 1rem;
}
</style>
