<template>
  <div class="depositos">
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
          class="elevation-1"
          :headers="headers"
          :items="depositos"
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
              counter="100"
              label="Nome do Depósito"
              required
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(100), sharedRules.alfanumerico]"
            />
            <v-text-field
              v-model="editedItem.endereco_logradouro"
              counter="100"
              label="Logradouro"
              required
              :rules="[sharedRules.required, sharedRules.minLength(5), sharedRules.maxLength(100), sharedRules.alfanumerico]"
            />
            <v-text-field
              v-model="editedItem.endereco_numero"
              counter="20"
              label="Número"
              required
              :rules="[sharedRules.required, sharedRules.maxLength(20), sharedRules.alfanumerico]"
            />
            <v-text-field
              v-model="editedItem.endereco_complemento"
              counter="255"
              label="Complemento"
              :rules="[sharedRules.maxLength(255)]"
            />
            <v-text-field
              v-model="editedItem.endereco_bairro"
              counter="150"
              label="Bairro"
              required
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(150), sharedRules.alfanumerico]"
            />
            <v-text-field
              v-model="editedItem.endereco_municipio"
              counter="150"
              label="Município"
              required
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(150), sharedRules.nome]"
            />
            <v-text-field
              v-model="editedItem.endereco_uf"
              counter="2"
              label="UF"
              maxlength="2"
              required
              :rules="[sharedRules.required, sharedRules.uf]"
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
  import type { Deposit } from '@/interfaces'
  import { DepositService } from '@/services'
  import { sharedRules } from '@/utils/rules'
  import { snackbarMixin } from '@/utils/snackbar'

  export default {
    name: 'Depositos',
    mixins: [snackbarMixin],
    data () {
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
      sharedRules () {
        return sharedRules
      },
      formTitle () {
        return this.editedIndex === -1 ? 'Novo Depósito' : 'Editar Depósito'
      },
    },
    mounted () {
      this.loadDepositos()
    },
    methods: {
      async loadDepositos () {
        this.loading = true
        try {
          this.depositos = await DepositService.getAll()
        } catch {
          this.showError('Erro ao carregar depósitos')
        } finally {
          this.loading = false
        }
      },

      openDialog () {
        this.dialog = true
      },

      editItem (item: any) {
        this.editedIndex = this.depositos.indexOf(item)
        this.editedItem = { ...item }
        this.dialog = true
      },

      deleteItem (item: any) {
        this.editedIndex = this.depositos.indexOf(item)
        this.editedItem = { ...item }
        this.deleteDialog = true
      },

      async deleteItemConfirm () {
        try {
          await DepositService.delete(this.editedItem.id)
          this.depositos.splice(this.editedIndex, 1)
          this.showSuccess('Depósito excluído com sucesso!')
        } catch {
          this.showError('Erro ao excluir depósito')
        }
        this.closeDeleteDialog()
      },

      closeDialog () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = { ...this.defaultItem }
          this.editedIndex = -1
        })
      },

      closeDeleteDialog () {
        this.deleteDialog = false
        this.$nextTick(() => {
          this.editedItem = { ...this.defaultItem }
          this.editedIndex = -1
        })
      },

      async save () {
        if (!this.validForm) return

        try {
          if (this.editedIndex > -1) {
            const updated = await DepositService.update(this.editedItem.id, this.editedItem)
            this.depositos[this.editedIndex] = updated
            this.showSuccess('Depósito atualizado com sucesso!')
          } else {
            const newItem = await DepositService.create(this.editedItem)
            this.depositos.push(newItem)
            this.showSuccess('Depósito criado com sucesso!')
          }
          this.closeDialog()
        } catch {
          this.showError('Erro ao salvar depósito')
        }
      },
    },
  }
</script>
