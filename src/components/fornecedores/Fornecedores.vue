<template>
  <div class="fornecedores">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Fornecedores</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Novo Fornecedor
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Fornecedores -->
        <v-data-table
          class="elevation-1"
          :headers="headers"
          :items="fornecedores"
          :loading="loading"
        >
          <template #[`item.actions`]="{ item }">
            <v-btn
              color="primary"
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="editItem(item)"
            />
            <v-btn
              color="error"
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="deleteItem(item)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog de Criação/Edição -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="validForm">
            <v-text-field
              v-model="editedItem.nome"
              counter="150"
              label="Nome do Fornecedor"
              required
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(150), sharedRules.nome]"
            />
            <v-text-field
              v-model="editedItem.cnpj"
              v-mask="'##.###.###/####-##'"
              label="CNPJ"
              :rules="[sharedRules.cnpj]"
              @keypress="onCNPJKeypress"
            />
            <v-text-field
              v-model="editedItem.contato_nome"
              counter="255"
              label="Nome do Contato"
              required
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(255), sharedRules.nome]"
            />
            <v-text-field
              v-model="editedItem.contato_valor"
              counter="50"
              label="Telefone/Email"
              :mask="getContactMask(editedItem.contato_tipo)"
              required
              :rules="[sharedRules.required, sharedRules.minLength(8), sharedRules.maxLength(50)]"
              @input="formatContactValue"
              @keypress="onContactKeypress"
            />
            <v-select
              v-model="editedItem.contato_tipo"
              :items="tipoContatoOptions"
              label="Tipo de Contato"
              required
              :rules="[sharedRules.required]"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!validForm"
            variant="text"
            @click="save"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o fornecedor "{{ editedItem.nome }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="closeDeleteDialog">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteItemConfirm">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
<!-- eslint-disable vue/no-mutating-props -->
</template>

<script lang="ts">
  import type { Supplier, SupplierFormData, TipoContato } from '@/interfaces'
  import { ContactService, SupplierService } from '@/services'
  import { sharedRules } from '@/utils/rules'
  import { snackbarMixin } from '@/utils/snackbar'

  type SupplierListItem = Supplier & {
    contato_id: number | null
    contato_nome: string
    contato_valor: string
    contato_tipo: TipoContato
  }

  function createSupplierForm (): SupplierFormData {
    return {
      id: 0,
      nome: '',
      cnpj: '',
      contato_id: null,
      contato_nome: '',
      contato_valor: '',
      contato_tipo: 'telefone',
    }
  }

  export default {
    name: 'Fornecedores',
    mixins: [snackbarMixin],
    data () {
      return {
        loading: false,
        saving: false,
        dialog: false,
        deleteDialog: false,
        validForm: false,
        formRef: null as any,
        fornecedores: [] as SupplierListItem[],
        editedIndex: -1,
        editedItem: createSupplierForm(),
        defaultItem: createSupplierForm(),
        headers: [
          { title: 'ID', key: 'id', sortable: true },
          { title: 'Nome', key: 'nome', sortable: true },
          { title: 'CNPJ', key: 'cnpj', sortable: true },
          { title: 'Contato', key: 'contato_nome', sortable: true },
          { title: 'Ações', key: 'actions', sortable: false },
        ],
        tipoContatoOptions: [
          { title: 'Telefone', value: 'telefone' },
          { title: 'Email', value: 'email' },
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Telegram', value: 'telegram' },
          { title: 'Outro', value: 'outro' },
        ],
      }
    },
    computed: {
      sharedRules () {
        return sharedRules
      },
    },
    mounted () {
      this.loadFornecedores()
    },
    methods: {
      async loadFornecedores () {
        this.loading = true
        try {
          const data = await SupplierService.getAllEnriched()
          this.fornecedores = data.map(fornecedor => ({
            ...fornecedor,
            cnpj: fornecedor.cnpj ?? '',
            contato_id: fornecedor.contato?.id ?? null,
            contato_nome: fornecedor.contato?.nome ?? '',
            contato_valor: fornecedor.contato?.valor ?? '',
            contato_tipo: (fornecedor.contato?.tipo_contato ?? 'telefone') as TipoContato,
          }))
        } catch {
          this.showError('Erro ao carregar fornecedores')
        } finally {
          this.loading = false
        }
      },

      openDialog () {
        this.dialog = true
        this.$nextTick(() => {
          this.editedItem = createSupplierForm()
          this.validForm = false
        })
      },

      editItem (item: SupplierListItem) {
        this.editedIndex = this.fornecedores.indexOf(item)
        this.editedItem = {
          id: item.id,
          nome: item.nome,
          cnpj: item.cnpj ?? '',
          contato_id: item.contato_id ?? null,
          contato_nome: item.contato_nome ?? '',
          contato_valor: item.contato_valor ?? '',
          contato_tipo: item.contato_tipo ?? 'telefone',
        }
        this.dialog = true
      },

      deleteItem (item: SupplierListItem) {
        this.editedIndex = this.fornecedores.indexOf(item)
        this.editedItem = {
          id: item.id,
          nome: item.nome,
          cnpj: item.cnpj ?? '',
          contato_id: item.contato_id ?? null,
          contato_nome: item.contato_nome ?? '',
          contato_valor: item.contato_valor ?? '',
          contato_tipo: item.contato_tipo ?? 'telefone',
        }
        this.deleteDialog = true
      },

      async deleteItemConfirm () {
        try {
          await SupplierService.delete(this.editedItem.id)
          this.fornecedores.splice(this.editedIndex, 1)
          this.showSuccess('Fornecedor excluído com sucesso!')
        } catch {
          this.showError('Erro ao excluir fornecedor')
        }
        this.closeDeleteDialog()
      },

      closeDialog () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = createSupplierForm()
          this.editedIndex = -1
          this.validForm = false
          if (this.formRef) {
            this.formRef.reset()
          }
        })
      },

      closeDeleteDialog () {
        this.deleteDialog = false
        this.$nextTick(() => {
          this.editedItem = createSupplierForm()
          this.editedIndex = -1
        })
      },

      sanitizeCnpj (value: string): string {
        if (!value) return ''
        const digits = value.replace(/\D/g, '')
        if (digits.length !== 14) {
          return value.trim()
        }
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
      },

      buildContactPayload () {
        const { contato_nome, contato_valor, contato_tipo } = this.editedItem
        if (!contato_nome || !contato_valor) return null

        const cleanedValue
          = contato_tipo === 'telefone' || contato_tipo === 'whatsapp'
            ? contato_valor.replace(/\D/g, '')
            : contato_valor.trim()

        return {
          nome: contato_nome.trim(),
          valor: cleanedValue,
          tipo_contato: contato_tipo,
          codigo_pais: contato_tipo === 'telefone' || contato_tipo === 'whatsapp' ? '55' : null,
        }
      },

      getContactMask (tipoContato: string) {
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
        const tipoContato = this.editedItem.contato_tipo

        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const numbers = value.replace(/\D/g, '')
          const limitedNumbers = numbers.slice(0, 11)

          if (limitedNumbers.length <= 2) {
            this.editedItem.contato_valor = limitedNumbers
          } else if (limitedNumbers.length <= 6) {
            this.editedItem.contato_valor = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
          } else if (limitedNumbers.length <= 10) {
            this.editedItem.contato_valor = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
          } else {
            this.editedItem.contato_valor = `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
          }
        } else {
          this.editedItem.contato_valor = value.slice(0, 100)
        }
      },

      onContactKeypress (event: KeyboardEvent) {
        const tipoContato = this.editedItem.contato_tipo

        if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
          const char = String.fromCodePoint(event.which)
          if (!/[0-9]/.test(char)) {
            event.preventDefault()
          }
        }
      },

      onCNPJKeypress (event: KeyboardEvent) {
        const char = String.fromCodePoint(event.which)
        if (!/[0-9]/.test(char)) {
          event.preventDefault()
        }
      },

      async save () {
        if (!this.validForm || this.saving) return

        this.saving = true
        try {
          const cnpj = this.sanitizeCnpj(this.editedItem.cnpj)
          const contactPayload = this.buildContactPayload()
          let contactId = this.editedItem.contato_id ?? null

          if (contactPayload) {
            if (contactId) {
              await ContactService.update(contactId, contactPayload)
            } else {
              const createdContact = await ContactService.create(contactPayload)
              contactId = createdContact.id
            }
          }

          const supplierPayload = {
            nome: this.editedItem.nome.trim(),
            cnpj: cnpj || undefined,
            id_contato: contactId ?? undefined,
          }

          if (this.editedIndex > -1) {
            await SupplierService.update(this.editedItem.id, supplierPayload)
            this.showSuccess('Fornecedor atualizado com sucesso!')
          } else {
            await SupplierService.create(supplierPayload)
            this.showSuccess('Fornecedor criado com sucesso!')
          }

          await this.loadFornecedores()
          this.closeDialog()
        } catch {
          this.showError('Erro ao salvar fornecedor')
        } finally {
          this.saving = false
        }
      },
    },
  }
</script>
