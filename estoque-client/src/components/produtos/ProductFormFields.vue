<template>
  <v-row>
    <!-- Informações do Produto (Edit Mode) -->
    <v-col v-if="isEditMode && detalheProduto" cols="12">
      <v-alert
        border="start"
        color="info"
        density="comfortable"
        icon="mdi-information-outline"
        variant="tonal"
      >
        <div class="d-flex flex-wrap align-center gap-4">
          <div>
            <strong>Código:</strong>
            <v-chip class="ml-2" color="primary" size="small" variant="flat">
              {{ produtoCodigo }}
            </v-chip>
          </div>
          <div v-if="detalheProduto?.responsavel_nome">
            <strong>Criado por:</strong> {{ detalheProduto.responsavel_nome }}
          </div>
          <div v-if="detalheProduto?.created_at">
            <strong>Criado em:</strong> {{ formatDate(detalheProduto.created_at) }}
          </div>
          <div v-if="detalheProduto?.updated_at">
            <strong>Última atualização:</strong> {{ formatDate(detalheProduto.updated_at) }}
          </div>
        </div>
      </v-alert>
    </v-col>

    <v-col
      v-if="isEditMode"
      cols="12"
      lg="6"
      md="6"
      sm="12"
    >
      <v-text-field
        label="Código do Produto"
        :model-value="produtoCodigo"
        prepend-inner-icon="mdi-identifier"
        readonly
        variant="outlined"
        density="comfortable"
      />
    </v-col>

    <!-- Informações Básicas -->
    <v-col cols="12" lg="6" md="6" sm="12">
      <v-text-field
        :model-value="formData.nome"
        label="Nome do Produto"
        placeholder="Digite o nome do produto"
        prepend-inner-icon="mdi-package-variant"
        required
        :rules="rules.nome"
        variant="outlined"
        density="comfortable"
        clearable
        @update:model-value="$emit('update:formData', { ...formData, nome: $event })"
      />
    </v-col>

    <v-col cols="12" lg="6" md="6" sm="12">
      <v-textarea
        :model-value="formData.descricao"
        label="Descrição"
        placeholder="Descreva o produto"
        prepend-inner-icon="mdi-text"
        required
        :rules="rules.descricao"
        variant="outlined"
        density="comfortable"
        rows="3"
        auto-grow
        clearable
        @update:model-value="$emit('update:formData', { ...formData, descricao: $event })"
      />
    </v-col>

    <!-- Categoria e Marca -->
    <v-col cols="12" lg="6" md="6" sm="12">
      <v-autocomplete
        :model-value="formData.id_categoria"
        :items="categoriaOptions"
        label="Categoria"
        placeholder="Selecione a categoria"
        prepend-inner-icon="mdi-tag"
        required
        :rules="rules.id_categoria"
        variant="outlined"
        density="comfortable"
        clearable
        @update:model-value="$emit('update:formData', { ...formData, id_categoria: $event })"
      />
    </v-col>

    <v-col cols="12" lg="6" md="6" sm="12">
      <v-autocomplete
        :model-value="formData.id_marca"
        :items="marcaOptions"
        label="Marca"
        placeholder="Selecione a marca"
        prepend-inner-icon="mdi-tag-multiple"
        required
        :rules="rules.id_marca"
        variant="outlined"
        density="comfortable"
        clearable
        @update:model-value="$emit('update:formData', { ...formData, id_marca: $event })"
      />
    </v-col>

    <!-- Unidade de Medida e Estoque Mínimo -->
    <v-col cols="12" lg="6" md="6" sm="12">
      <v-autocomplete
        :model-value="formData.id_unidade_medida"
        :items="unidadeMedidaOptions"
        label="Unidade de Medida"
        placeholder="Selecione a unidade"
        prepend-inner-icon="mdi-scale"
        required
        :rules="rules.id_unidade_medida"
        variant="outlined"
        density="comfortable"
        clearable
        @update:model-value="$emit('update:formData', { ...formData, id_unidade_medida: $event })"
      />
    </v-col>

    <v-col cols="12" lg="6" md="6" sm="12">
      <v-text-field
        :model-value="formData.estoque_minimo"
        label="Estoque Mínimo"
        placeholder="0"
        prepend-inner-icon="mdi-warehouse"
        required
        :rules="rules.estoque_minimo"
        type="number"
        variant="outlined"
        density="comfortable"
        min="0"
        step="1"
        @update:model-value="$emit('update:formData', { ...formData, estoque_minimo: Number($event) || 0 })"
      />
    </v-col>

    <!-- Produto Perecível -->
    <v-col cols="12">
      <v-checkbox
        :model-value="formData.is_perecivel"
        color="primary"
        label="Produto Perecível"
        @update:model-value="$emit('update:formData', { ...formData, is_perecivel: $event })"
      />
    </v-col>

    <v-col
      v-if="formData.is_perecivel"
      cols="12"
      lg="6"
      md="6"
      sm="12"
    >
      <v-text-field
        :model-value="formData.data_validade"
        label="Data de Validade"
        placeholder="YYYY-MM-DD"
        prepend-inner-icon="mdi-calendar"
        required
        :rules="rules.data_validade"
        type="date"
        variant="outlined"
        density="comfortable"
        @update:model-value="$emit('update:formData', { ...formData, data_validade: $event })"
      />
    </v-col>

    <!-- Fornecedores -->
    <v-col cols="12">
      <v-divider class="my-4" />
      <h3 class="text-h6 font-weight-bold mb-3">
        <v-icon class="mr-2">mdi-truck</v-icon>
        Fornecedores
      </h3>
    </v-col>

    <v-col cols="12">
      <v-autocomplete
        :model-value="selectedFornecedores"
        chips
        closable-chips
        hint="Selecione um ou mais fornecedores para este produto"
        :items="availableFornecedorOptions"
        label="Selecionar Fornecedores"
        multiple
        persistent-hint
        placeholder="Selecione os fornecedores"
        prepend-inner-icon="mdi-truck"
        variant="outlined"
        density="comfortable"
        clearable
        @update:model-value="$emit('update:selectedFornecedores', $event)"
      />
    </v-col>

    <v-col v-if="fornecedoresVinculados.length > 0" cols="12">
      <v-card class="pa-3" color="grey-darken-4" variant="tonal">
        <div class="text-caption text-grey-lighten-1 mb-2">Fornecedores vinculados:</div>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="fornecedor in fornecedoresVinculados"
            :key="fornecedor.id_fornecedor"
            closable
            color="primary"
            size="small"
            variant="flat"
            @click:close="$emit('remove-fornecedor', fornecedor.id_fornecedor)"
          >
            <v-icon class="mr-1" size="small">mdi-truck</v-icon>
            {{ fornecedor.nome }}
          </v-chip>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-switch
        :model-value="formData.ativo"
        color="success"
        inset
        label="Produto ativo"
        @update:model-value="$emit('update:formData', { ...formData, ativo: $event })"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
// @ts-nocheck
import type { Brand, Category, ProductDetail, Supplier, UnitMeasure } from '@/interfaces'
import { productRules, sharedRules } from '@/utils/rules'

export interface ProductFormData {
  nome: string
  descricao: string
  id_categoria: number | null
  id_marca: number | null
  id_unidade_medida: number | null
  estoque_minimo: number
  is_perecivel: boolean
  data_validade: string | null
  ativo: boolean
}

export default {
  name: 'ProductFormFields',
  props: {
    formData: {
      type: Object as () => ProductFormData,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
    produtoCodigo: {
      type: String,
      default: '',
    },
    detalheProduto: {
      type: Object as () => ProductDetail | null,
      default: null,
    },
    categorias: {
      type: Array as () => Category[],
      default: () => [],
    },
    marcas: {
      type: Array as () => Brand[],
      default: () => [],
    },
    unidadesMedida: {
      type: Array as () => UnitMeasure[],
      default: () => [],
    },
    fornecedores: {
      type: Array as () => Supplier[],
      default: () => [],
    },
    selectedFornecedores: {
      type: Array as () => number[],
      default: () => [],
    },
    fornecedoresVinculados: {
      type: Array as () => Array<{ id_fornecedor: number, nome: string }>,
      default: () => [],
    },
    fornecedoresInfo: {
      type: Array as () => Array<{ id_fornecedor: number, nome: string }>,
      default: () => [],
    },
  },
  emits: [
    'update:formData',
    'update:selectedFornecedores',
    'remove-fornecedor',
  ],
  computed: {
    rules () {
      return {
        nome: [productRules.required, sharedRules.minLength(3)],
        descricao: [productRules.required, sharedRules.minLength(10)],
        id_categoria: [(v: number) => !!v || 'Categoria é obrigatória'],
        id_marca: [(v: number) => !!v || 'Marca é obrigatória'],
        id_unidade_medida: [(v: number) => !!v || 'Unidade de medida é obrigatória'],
        estoque_minimo: [(v: number) => v >= 0 || 'Estoque mínimo deve ser maior ou igual a 0'],
        data_validade: [
          (v: string) => {
            if (!this.formData.is_perecivel) return true
            return !!v || 'Data de validade é obrigatória para produtos perecíveis'
          },
        ],
      }
    },
    categoriaOptions () {
      return this.categorias.map(cat => ({
        title: cat.nome,
        value: cat.id,
      }))
    },
    marcaOptions () {
      return this.marcas.map(marca => ({
        title: marca.nome,
        value: marca.id,
      }))
    },
    unidadeMedidaOptions () {
      return this.unidadesMedida.map(um => ({
        title: `${um.descricao} (${um.abreviacao})`,
        value: um.id,
      }))
    },
    availableFornecedorOptions () {
      const vinculadosIds = new Set(this.fornecedoresVinculados.map(f => f.id_fornecedor))
      return this.fornecedores
        .filter(f => !vinculadosIds.has(f.id))
        .map(fornecedor => ({
          title: fornecedor.nome,
          value: fornecedor.id,
        }))
    },
  },
  methods: {
    formatDate (value?: string | null): string {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return '-'
      }
      return date.toLocaleString('pt-BR')
    },
  },
}
</script>

<style scoped>
</style>

