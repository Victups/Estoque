<template>
  <div class="categorias">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Categorias</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Nova Categoria
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Categorias -->
        <v-data-table
          :headers="headers"
          :items="categorias"
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
              label="Nome da Categoria"
              :rules="[sharedRules.required, sharedRules.minLength(2), sharedRules.maxLength(100), categoriaRules.nome]"
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
          Tem certeza que deseja excluir a categoria "{{ editedItem.nome }}"?
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
import type { Category } from '@/types'
import { CategoryService } from '@/services'
import { categoriaRules, sharedRules } from '@/utils/rules'
import { snackbarMixin } from '@/utils/snackbar'

export default {
  name: 'Categorias',
  mixins: [snackbarMixin],
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nova Categoria' : 'Editar Categoria'
    },
    categoriaRules() {
      return categoriaRules
    },
    sharedRules() {
      return sharedRules
    },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      deleteDialog: false,
      validForm: false,
      formRef: null as any,
      categorias: [] as Category[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        nome: '',
      } as Category,
      defaultItem: {
        id: 0,
        nome: '',
      } as Category,
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Nome', key: 'nome', sortable: true },
        { title: 'Ações', key: 'actions', sortable: false },
      ],
    }
  },
  mounted() {
    this.loadCategorias()
  },
  methods: {
    async loadCategorias() {
      this.loading = true
      try {
        this.categorias = await CategoryService.getAll()
      } catch (error) {
        this.showError('Erro ao carregar categorias')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: Category) {
      this.editedIndex = this.categorias.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    deleteItem(item: Category) {
      this.editedIndex = this.categorias.indexOf(item)
      this.editedItem = { ...item }
      this.deleteDialog = true
    },

    async deleteItemConfirm() {
      try {
        await CategoryService.delete(this.editedItem.id)
        this.categorias.splice(this.editedIndex, 1)
        this.showSuccess('Categoria excluída com sucesso!')
      } catch (error) {
        this.showError('Erro ao excluir categoria')
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
          const updated = await CategoryService.update(this.editedItem.id, this.editedItem)
          this.categorias[this.editedIndex] = updated
          this.showSuccess('Categoria atualizada com sucesso!')
        } else {
          const newItem = await CategoryService.create(this.editedItem)
          this.categorias.push(newItem)
          this.showSuccess('Categoria criada com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar categoria')
      }
    },
  },
}
</script>


