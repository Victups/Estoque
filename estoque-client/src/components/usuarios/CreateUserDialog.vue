<template>
  <v-dialog :model-value="modelValue" max-width="800" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card elevation="8">
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-2" icon="mdi-account-plus" size="30" />
          <span class="text-h5">Criar Novo Usuário</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="createFormRef" v-model="validForm">
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
                v-model="localUser.name"
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
                v-model="localUser.email"
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
                v-model="localUser.tipo_contato"
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
                v-model="localUser.valor_contato"
                density="comfortable"
                hide-details="auto"
                label="Valor do Contato"
                :mask="getContactMask(localUser.tipo_contato)"
                prepend-inner-icon="mdi-account-voice"
                :rules="[rules.required]"
                variant="outlined"
                @input="formatContactValue"
                @keypress="onContactKeypress"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="localUser.codigo_pais"
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
                v-model="localUser.id_uf"
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
                v-model="localUser.id_municipio"
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
                v-model="localUser.logradouro"
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
                v-model="localUser.numero"
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
                v-model="localUser.complemento"
                density="comfortable"
                hide-details="auto"
                label="Complemento"
                prepend-inner-icon="mdi-home"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="localUser.bairro"
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
                v-model="localUser.role"
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
                v-model="localUser.password"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                density="comfortable"
                hide-details="auto"
                label="Senha"
                prepend-inner-icon="mdi-lock"
                :rules="[rules.required, rules.minLength]"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="showPassword = !showPassword"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="localUser.confirmPassword"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                density="comfortable"
                hide-details="auto"
                label="Confirmar Senha"
                prepend-inner-icon="mdi-lock-check"
                :rules="[rules.required, rules.newPasswordMatch]"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
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
          @click="handleCreate"
        >
          <v-icon class="mr-1" icon="mdi-account-plus" />
          Criar Usuário
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import type { Municipality, NewUserForm, State, UserRole, ValidationRule } from '@/interfaces'
  import type { VForm } from '@/interfaces/ui/form'
  import { defineComponent } from 'vue'
  import { MunicipalityService } from '@/services'
  import { userRules } from '@/utils/rules'

  export default defineComponent({
    name: 'CreateUserDialog',
    props: {
      modelValue: {
        type: Boolean,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      ufs: {
        type: Array as () => State[],
        required: true,
      },
    },
    emits: ['update:modelValue', 'create', 'cancel'],
    data () {
      return {
        validForm: false,
        createFormRef: null as VForm | null,
        localUser: {
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
          bairro: '',
        } as NewUserForm,
        showPassword: false,
        showConfirmPassword: false,
        municipios: [] as Municipality[],
      }
    },
    computed: {
      rules () {
        return {
          required: userRules.required,
          email: userRules.email,
          minLength: userRules.minLength(6),
          newPasswordMatch: (v: string): boolean | string => userRules.passwordMatch({ value: this.localUser.password })(v),
        }
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
    },
    watch: {
      modelValue (newVal) {
        if (newVal) {
          this.resetForm()
        }
      },
    },
    methods: {
      resetForm () {
        this.localUser = {
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
        this.municipios = []
        this.createFormRef?.reset()
      },
      async onUfChange (ufId: number) {
        this.localUser.id_municipio = null
        if (ufId) {
          try {
            this.municipios = await MunicipalityService.getByUf(ufId)
          } catch (error) {
            console.error('Erro ao carregar municípios:', error)
          }
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
          default: {
            return ''
          }
        }
      },
      formatContactValue (event: Event) {
        const target = event.target as HTMLInputElement
        const value = target.value
        const tipoContato = this.localUser.tipo_contato

        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const numbers = value.replace(/\D/g, '')
          const limitedNumbers = numbers.slice(0, 11)

          if (limitedNumbers.length <= 2) {
            this.localUser.valor_contato = limitedNumbers
          } else if (limitedNumbers.length <= 6) {
            this.localUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
          } else if (limitedNumbers.length <= 10) {
            this.localUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
          } else {
            this.localUser.valor_contato = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
          }
        } else {
          this.localUser.valor_contato = value.slice(0, 100)
        }
      },
      onContactKeypress (event: KeyboardEvent) {
        const tipoContato = this.localUser.tipo_contato
        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const char = String.fromCodePoint(event.which)
          if (!/[0-9]/.test(char)) {
            event.preventDefault()
          }
        }
      },
      handleCancel () {
        this.$emit('cancel')
        this.resetForm()
      },
      handleCreate () {
        this.$emit('create', { ...this.localUser })
      },
    },
  })
</script>

