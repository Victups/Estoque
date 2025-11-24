<template>
  <v-dialog :model-value="modelValue" max-width="800" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card v-if="user" elevation="8">
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-2" icon="mdi-account-edit" size="30" />
          <span class="text-h5">Editar Usuário</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="editFormRef" v-model="validForm">
          <v-row>
            <v-col class="text-center mb-4" cols="12">
              <v-avatar :color="localUser.avatarColor" size="80">
                <span class="text-h4 text-white">{{ localUser.initials }}</span>
              </v-avatar>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="localUser.name"
                density="comfortable"
                label="Nome Completo"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="localUser.email"
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
                v-model="localUser.role"
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
                v-model="localUser.status"
                density="comfortable"
                :items="statusItems"
                item-title="title"
                item-value="value"
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
          @click="handleCancel"
        >
          <v-icon class="mr-1" icon="mdi-close" />
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!validForm"
          :loading="loading"
          variant="elevated"
          @click="handleSave"
        >
          <v-icon class="mr-1" icon="mdi-content-save" />
          Salvar Alterações
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import type { User, ValidationRule } from '@/interfaces'
  import type { VForm } from '@/interfaces/ui/form'
  import { defineComponent } from 'vue'
  import { userRules } from '@/utils/rules'

  export default defineComponent({
    name: 'EditUserDialog',
    props: {
      modelValue: {
        type: Boolean,
        required: true,
      },
      user: {
        type: Object as () => User | null,
        default: null,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue', 'save', 'cancel'],
    data () {
      return {
        validForm: false,
        editFormRef: null as VForm | null,
        localUser: {} as User,
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        statusItems: [
          { title: 'Ativo', value: 'active' },
          { title: 'Inativo', value: 'inactive' },
        ],
      }
    },
    computed: {
      rules () {
        return {
          required: userRules.required,
          email: userRules.email,
          minLength: userRules.minLength(6),
          passwordMatch: (v: string): boolean | string => userRules.passwordMatch({ value: this.newPassword })(v),
        }
      },
    },
    watch: {
      user: {
        immediate: true,
        handler (newUser) {
          if (newUser) {
            this.localUser = { ...newUser }
            this.changePassword = false
            this.newPassword = ''
            this.confirmPassword = ''
          }
        },
      },
      modelValue (newVal) {
        if (!newVal) {
          this.resetForm()
        }
      },
    },
    methods: {
      resetForm () {
        this.changePassword = false
        this.newPassword = ''
        this.confirmPassword = ''
        this.editFormRef?.reset()
      },
      handleCancel () {
        this.$emit('cancel')
        this.resetForm()
      },
      handleSave () {
        this.$emit('save', {
          user: this.localUser,
          changePassword: this.changePassword,
          newPassword: this.newPassword,
        })
      },
    },
  })
</script>

