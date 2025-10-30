<template>
  <div class="marcas">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Marcas</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Nova Marca
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Marcas -->
        <v-data-table
          :headers="headers"
          :items="marcas"
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
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="validForm">
            <v-text-field
              v-model="editedItem.nome"
              label="Nome da Marca"
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(100), sharedRules.nome]"
              counter="100"
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
          Tem certeza que deseja excluir a marca "{{ editedItem.nome }}"?
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
import type { Brand } from '@/types'
import { BrandService } from '@/services'
import { snackbarMixin } from '@/utils/snackbar'
import { sharedRules } from '@/utils/rules'

export default {
  name: 'Marcas',
  mixins: [snackbarMixin],
  computed: {
    sharedRules() {
      return sharedRules
    },
    formTitle() {
      return this.editedIndex === -1 ? 'Nova Marca' : 'Editar Marca'
    },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      deleteDialog: false,
      validForm: false,
      formRef: null as any,
      marcas: [] as Brand[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        nome: '',
      } as Brand,
      defaultItem: {
        id: 0,
        nome: '',
      } as Brand,
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Nome', key: 'nome', sortable: true },
        { title: 'Ações', key: 'actions', sortable: false },
      ],
    }
  },
  mounted() {
    this.loadMarcas()
  },
  methods: {
    async loadMarcas() {
      this.loading = true
      try {
        this.marcas = await BrandService.getAll()
      } catch (error) {
        this.showError('Erro ao carregar marcas')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: Brand) {
      this.editedIndex = this.marcas.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    deleteItem(item: Brand) {
      this.editedIndex = this.marcas.indexOf(item)
      this.editedItem = { ...item }
      this.deleteDialog = true
    },

    async deleteItemConfirm() {
      try {
        await BrandService.delete(this.editedItem.id)
        this.marcas.splice(this.editedIndex, 1)
        this.showSuccess('Marca excluída com sucesso!')
      } catch (error) {
        this.showError('Erro ao excluir marca')
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
          const updated = await BrandService.update(this.editedItem.id, this.editedItem)
          this.marcas[this.editedIndex] = updated
          this.showSuccess('Marca atualizada com sucesso!')
        } else {
          const newItem = await BrandService.create(this.editedItem)
          this.marcas.push(newItem)
          this.showSuccess('Marca criada com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar marca')
      }
    },
  },
}
</script>


