<template>
  <div class="localizacoes-crud">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Localizações</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Nova Localização
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Localizações -->
        <v-data-table
          :headers="headers"
          :items="localizacoes"
          :loading="loading"
          class="elevation-1"
        >
          <template #[`item.deposito_nome`]="{ item }">
            <v-chip color="info" variant="outlined">
              {{ item.deposito_nome }}
            </v-chip>
          </template>
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
            <v-select
              v-model="editedItem.id_deposito"
              :items="depositos"
              item-title="nome"
              item-value="id"
              label="Depósito"
              :rules="[validation.required]"
              required
            />
            <v-text-field
              v-model="editedItem.corredor"
              label="Corredor"
              :rules="[validation.maxLength(50), validation.alfanumerico]"
              counter="50"
            />
            <v-text-field
              v-model="editedItem.prateleira"
              label="Prateleira"
              :rules="[validation.maxLength(50), validation.alfanumerico]"
              counter="50"
            />
            <v-text-field
              v-model="editedItem.secao"
              label="Seção"
              :rules="[validation.maxLength(50), validation.alfanumerico]"
              counter="50"
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
          Tem certeza que deseja excluir esta localização?
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
import type { Location, Deposit } from '@/types'
import { LocationService, DepositService } from '@/services'
import { validationMixin } from '@/utils/validation'
import { snackbarMixin } from '@/utils/snackbar'

export default {
  name: 'LocalizacoesCRUD',
  mixins: [validationMixin, snackbarMixin],
  data() {
    return {
      loading: false,
      dialog: false,
      deleteDialog: false,
      validForm: false,
      formRef: null as any,
      localizacoes: [] as Location[],
      depositos: [] as Deposit[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        id_deposito: 0,
        corredor: '',
        prateleira: '',
        secao: '',
      } as any,
      defaultItem: {
        id: 0,
        id_deposito: 0,
        corredor: '',
        prateleira: '',
        secao: '',
      } as any,
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Depósito', key: 'deposito_nome', sortable: true },
        { title: 'Corredor', key: 'corredor', sortable: true },
        { title: 'Prateleira', key: 'prateleira', sortable: true },
        { title: 'Seção', key: 'secao', sortable: true },
        { title: 'Ações', key: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nova Localização' : 'Editar Localização'
    },
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [localizacoes, depositos] = await Promise.all([
          LocationService.getAll(),
          DepositService.getAll(),
        ])
        this.localizacoes = localizacoes
        this.depositos = depositos
      } catch (error) {
        this.showError('Erro ao carregar dados')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: any) {
      this.editedIndex = this.localizacoes.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    deleteItem(item: any) {
      this.editedIndex = this.localizacoes.indexOf(item)
      this.editedItem = { ...item }
      this.deleteDialog = true
    },

    async deleteItemConfirm() {
      try {
        await LocationService.delete(this.editedItem.id)
        this.localizacoes.splice(this.editedIndex, 1)
        this.showSuccess('Localização excluída com sucesso!')
      } catch (error) {
        this.showError('Erro ao excluir localização')
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

    async save() {
      if (!this.validForm) return

      try {
        if (this.editedIndex > -1) {
          // Editar
          const updated = await LocationService.update(this.editedItem.id, this.editedItem)
          this.localizacoes[this.editedIndex] = updated
          this.showSuccess('Localização atualizada com sucesso!')
        } else {
          // Criar
          const newItem = await LocationService.create(this.editedItem)
          this.localizacoes.push(newItem)
          this.showSuccess('Localização criada com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar localização')
      }
    },
  },
}
</script>
