<template>
  <div class="unidades-medida-crud">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Gerenciar Unidades de Medida</span>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Nova Unidade
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Tabela de Unidades de Medida -->
        <v-data-table
          :headers="headers"
          :items="unidades"
          :loading="loading"
          class="elevation-1"
        >
          <template #[`item.abreviacao`]="{ item }">
            <v-chip color="primary" variant="outlined">
              {{ item.abreviacao }}
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
            <!-- Unidade de Medida não pode ser excluída (é enum do banco) -->
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
              v-model="editedItem.descricao"
              label="Descrição"
              :rules="[validation.required, validation.minLength(2), validation.maxLength(50), validation.alfanumerico]"
              counter="50"
              required
            />
            <v-select
              v-model="editedItem.abreviacao"
              :items="unidadeOptions"
              label="Abreviação"
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

    <!-- Dialog de Confirmação de Exclusão removido - Unidade de Medida é enum do banco -->
  </div>
</template>

<script lang="ts">
import type { UnitMeasure, UnidadeAbreviacao } from '@/types'
import { UnitMeasureService } from '@/services'
import { validationMixin } from '@/utils/validation'
import { snackbarMixin } from '@/utils/snackbar'

export default {
  name: 'UnidadesMedidaCRUD',
  mixins: [validationMixin, snackbarMixin],
  data() {
    return {
      loading: false,
      dialog: false,
      validForm: false,
      formRef: null as any,
      unidades: [] as UnitMeasure[],
      editedIndex: -1,
      editedItem: {
        id: 0,
        descricao: '',
        abreviacao: 'un' as UnidadeAbreviacao,
      } as UnitMeasure,
      defaultItem: {
        id: 0,
        descricao: '',
        abreviacao: 'un' as UnidadeAbreviacao,
      } as UnitMeasure,
      headers: [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Descrição', key: 'descricao', sortable: true },
        { title: 'Abreviação', key: 'abreviacao', sortable: true },
        { title: 'Ações', key: 'actions', sortable: false },
      ],
      unidadeOptions: [
        { title: 'Unidade', value: 'un' },
        { title: 'Quilograma', value: 'kg' },
        { title: 'Litro', value: 'L' },
        { title: 'Pacote', value: 'pac' },
        { title: 'Caixa', value: 'cx' },
        { title: 'Grama', value: 'g' },
        { title: 'Mililitro', value: 'ml' },
      ],
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nova Unidade de Medida' : 'Editar Unidade de Medida'
    },
  },
  mounted() {
    this.loadUnidades()
  },
  methods: {
    async loadUnidades() {
      this.loading = true
      try {
        this.unidades = await UnitMeasureService.getAll()
      } catch (error) {
        this.showError('Erro ao carregar unidades de medida')
      } finally {
        this.loading = false
      }
    },

    openDialog() {
      this.dialog = true
    },

    editItem(item: UnitMeasure) {
      this.editedIndex = this.unidades.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },

    // deleteItem removido - Unidade de Medida não pode ser excluída (é enum do banco)

    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.editedIndex = -1
      })
    },

    // closeDeleteDialog removido - Unidade de Medida não pode ser excluída

    async save() {
      if (!this.validForm) return

      try {
        if (this.editedIndex > -1) {
          // Editar
          const updated = await UnitMeasureService.update(this.editedItem.id, this.editedItem)
          this.unidades[this.editedIndex] = updated
          this.showSuccess('Unidade de medida atualizada com sucesso!')
        } else {
          // Criar
          const newItem = await UnitMeasureService.create(this.editedItem)
          this.unidades.push(newItem)
          this.showSuccess('Unidade de medida criada com sucesso!')
        }
        this.closeDialog()
      } catch (error) {
        this.showError('Erro ao salvar unidade de medida')
      }
    },
  },
}
</script>
