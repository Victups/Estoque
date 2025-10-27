<template>
  <div class="depositos-crud">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Depósitos</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Novo Depósito
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Depósitos -->
        <v-data-table
          :headers="headers"
          :items="depositos"
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
              label="Nome do Depósito"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(100), validation.alfanumerico]"
              counter="100"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_logradouro"
              label="Logradouro"
              :rules="[validation.required, validation.minLength(5), validation.maxLength(100), validation.alfanumerico]"
              counter="100"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_numero"
              label="Número"
              :rules="[validation.required, validation.maxLength(20), validation.alfanumerico]"
              counter="20"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_complemento"
              label="Complemento"
              :rules="[validation.maxLength(255)]"
              counter="255"
            />
            <v-text-field
              v-model="editedItem.endereco_cep"
              label="CEP"
              :rules="[validation.required, validation.cep]"
              v-mask="'#####-###'"
              @keypress="onCEPKeypress"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_bairro"
              label="Bairro"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(150), validation.alfanumerico]"
              counter="150"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_municipio"
              label="Município"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(150), validation.nome]"
              counter="150"
              required
            />
            <v-text-field
              v-model="editedItem.endereco_uf"
              label="UF"
              :rules="[validation.required, validation.uf]"
              maxlength="2"
              counter="2"
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
          Tem certeza que deseja excluir o depósito "{{ editedItem.nome }}"?
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
import type { Deposit } from '@/types'
import { DepositService } from '@/services'
import { validationMixin } from '@/utils/validation'
import { snackbarMixin } from '@/utils/snackbar'

export default {
  name: 'DepositosCRUD',
  mixins: [validationMixin, snackbarMixin],
  data() {
    return {
      loading: false,
      dialog: false,
      deleteDialog: false,
      validForm: false,
      formRef: null as any,
      depositos: [] as Deposit[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        nome: '',
        endereco_logradouro: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_cep: '',
        endereco_bairro: '',
        endereco_municipio: '',
        endereco_uf: '',
      } as any,
      defaultItem: {
        id: 0,
        nome: '',
        endereco_logradouro: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_cep: '',
        endereco_bairro: '',
        endereco_municipio: '',
        endereco_uf: '',
      } as any,
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Nome', key: 'nome', sortable: true },
        { title: 'Endereço', key: 'endereco_logradouro', sortable: true },
        { title: 'Ações', key: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Novo Depósito' : 'Editar Depósito'
    },
  },
  mounted() {
    this.loadDepositos()
  },
  methods: {
    async loadDepositos() {
      this.loading = true
      try {
        this.depositos = await DepositService.getAll()
      } catch (error) {
        this.showError('Erro ao carregar depósitos')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: any) {
      this.editedIndex = this.depositos.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    deleteItem(item: any) {
      this.editedIndex = this.depositos.indexOf(item)
      this.editedItem = { ...item }
      this.deleteDialog = true
    },

    async deleteItemConfirm() {
      try {
        await DepositService.delete(this.editedItem.id)
        this.depositos.splice(this.editedIndex, 1)
        this.showSuccess('Depósito excluído com sucesso!')
      } catch (error) {
        this.showError('Erro ao excluir depósito')
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

    onCEPKeypress(event: KeyboardEvent) {
      // Apenas números são permitidos para CEP
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
          const updated = await DepositService.update(this.editedItem.id, this.editedItem)
          this.depositos[this.editedIndex] = updated
          this.showSuccess('Depósito atualizado com sucesso!')
        } else {
          // Criar
          const newItem = await DepositService.create(this.editedItem)
          this.depositos.push(newItem)
          this.showSuccess('Depósito criado com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar depósito')
      }
    },
  },
}
</script>
