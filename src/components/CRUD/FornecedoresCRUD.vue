<template>
  <div class="fornecedores-crud">
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
          :headers="headers"
          :items="fornecedores"
          :loading="loading"
          class="elevation-1"
        >
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              @click="editItem(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
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
              label="Nome do Fornecedor"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(150), validation.nome]"
              counter="150"
              required
            />
            <v-text-field
              v-model="editedItem.cnpj"
              label="CNPJ"
              :rules="[validation.cnpj]"
              v-mask="'##.###.###/####-##'"
              @keypress="onCNPJKeypress"
            />
            <v-text-field
              v-model="editedItem.contato_nome"
              label="Nome do Contato"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(255), validation.nome]"
              counter="255"
              required
            />
            <v-text-field
              v-model="editedItem.contato_valor"
              label="Telefone/Email"
              :rules="[validation.required, validation.minLength(8), validation.maxLength(50)]"
              counter="50"
              :mask="getContactMask(editedItem.contato_tipo)"
              @input="formatContactValue"
              @keypress="onContactKeypress"
              required
            />
            <v-select
              v-model="editedItem.contato_tipo"
              :items="tipoContatoOptions"
              label="Tipo de Contato"
              :rules="[validation.required]"
              required
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
            variant="text"
            :disabled="!validForm"
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
</template>

<script lang="ts">
import type { Supplier, TipoContato } from '@/types'
import { SupplierService } from '@/services'
import { validationMixin } from '@/utils/validation'
import { snackbarMixin } from '@/utils/snackbar'

export default {
  name: 'FornecedoresCRUD',
  mixins: [validationMixin, snackbarMixin],
  data() {
    return {
      loading: false,
      dialog: false,
      deleteDialog: false,
      validForm: false,
      formRef: null as any,
      fornecedores: [] as Supplier[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        nome: '',
        cnpj: '',
        contato_nome: '',
        contato_valor: '',
        contato_tipo: 'telefone' as TipoContato,
      } as any,
      defaultItem: {
        id: 0,
        nome: '',
        cnpj: '',
        contato_nome: '',
        contato_valor: '',
        contato_tipo: 'telefone' as TipoContato,
      } as any,
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
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Fornecedor' : 'Editar Fornecedor'
    },
  },
  mounted() {
    this.loadFornecedores()
  },
  methods: {
    async loadFornecedores() {
      this.loading = true
      try {
        this.fornecedores = await SupplierService.getAll()
      } catch (error) {
        this.showError('Erro ao carregar fornecedores')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: any) {
      this.editedIndex = this.fornecedores.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    deleteItem(item: any) {
      this.editedIndex = this.fornecedores.indexOf(item)
      this.editedItem = { ...item }
      this.deleteDialog = true
    },

    async deleteItemConfirm() {
      try {
        await SupplierService.delete(this.editedItem.id)
        this.fornecedores.splice(this.editedIndex, 1)
        this.showSuccess('Fornecedor excluído com sucesso!')
      } catch (error) {
        this.showError('Erro ao excluir fornecedor')
      }
      this.closeDeleteDialog()
    },

    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.editedIndex = -1
      })
    },

    closeDeleteDialog() {
      this.deleteDialog = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.editedIndex = -1
      })
    },

    getContactMask(tipoContato: string) {
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

    formatContactValue(event: Event) {
      const target = event.target as HTMLInputElement
      const value = target.value
      const tipoContato = this.editedItem.contato_tipo

      if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
        // Remove todos os caracteres não numéricos
        const numbers = value.replace(/\D/g, '')

        // Limita a 11 dígitos (máximo para telefone brasileiro)
        const limitedNumbers = numbers.slice(0, 11)

        // Aplica a máscara baseada no tamanho
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
        // Para outros tipos, permite qualquer caractere mas limita o tamanho
        this.editedItem.contato_valor = value.slice(0, 100)
      }
    },

    onContactKeypress(event: KeyboardEvent) {
      const tipoContato = this.editedItem.contato_tipo

      if (tipoContato === 'telefone' || tipoContato === 'whatsapp') {
        // Apenas números são permitidos para telefone
        const char = String.fromCodePoint(event.which)
        if (!/[0-9]/.test(char)) {
          event.preventDefault()
        }
      }
      // Para outros tipos (email, instagram, etc.), permite qualquer caractere
    },

    onCNPJKeypress(event: KeyboardEvent) {
      // Apenas números são permitidos para CNPJ
      const char = String.fromCodePoint(event.which)
      if (!/[0-9]/.test(char)) {
        event.preventDefault()
      }
    },

    async save() {
      if (!this.validForm) return

      try {
        if (this.editedIndex > -1) {
          // Editar
          const updated = await SupplierService.update(this.editedItem.id, this.editedItem)
          this.fornecedores[this.editedIndex] = updated
          this.showSuccess('Fornecedor atualizado com sucesso!')
        } else {
          // Criar
          const newItem = await SupplierService.create(this.editedItem)
          this.fornecedores.push(newItem)
          this.showSuccess('Fornecedor criado com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar fornecedor')
      }
    },
  },
}
</script>
