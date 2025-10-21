<template>
  <v-card class="filtros-card" elevation="2" rounded="xl">
    <v-card-title class="filtros-header">
      <v-icon class="mr-2" color="primary">mdi-filter-variant</v-icon>
      <span class="font-weight-bold">Filtros de Relatórios</span>
      <v-spacer />
      <v-btn
        v-if="hasActiveFilters"
        color="error"
        size="small"
        variant="text"
        prepend-icon="mdi-close"
        @click="clearFilters"
      >
        Limpar Filtros
      </v-btn>
    </v-card-title>
    
    <v-divider />
    
    <v-card-text class="pa-4">
      <v-row>
        <!-- Filtro por Categoria -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filtros.categoriaId"
            :items="categorias"
            item-title="nome"
            item-value="id"
            label="Categoria"
            placeholder="Selecione uma categoria"
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-tag"
            @update:model-value="onFiltroChange"
          />
        </v-col>

        <!-- Filtro por Tipo de Movimentação -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filtros.tipoMovimentacao"
            :items="tiposMovimentacao"
            item-title="text"
            item-value="value"
            label="Tipo de Movimentação"
            placeholder="Selecione o tipo"
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-swap-horizontal"
            @update:model-value="onFiltroChange"
          />
        </v-col>

        <!-- Filtro por Usuário -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filtros.usuarioId"
            :items="usuarios"
            item-title="nome"
            item-value="id"
            label="Usuário"
            placeholder="Selecione um usuário"
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
            @update:model-value="onFiltroChange"
          />
        </v-col>

        <!-- Filtro por Período -->
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.dataInicio"
                label="Data Início"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-start"
                @update:model-value="onFiltroChange"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.dataFim"
                label="Data Fim"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-end"
                @update:model-value="onFiltroChange"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Filtro por Status do Lote -->
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="filtros.statusLote"
            :items="statusLote"
            item-title="text"
            item-value="value"
            label="Status do Lote"
            placeholder="Selecione o status"
            clearable
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-package-variant"
            @update:model-value="onFiltroChange"
          />
        </v-col>
      </v-row>

      <!-- Resumo dos Filtros Ativos -->
      <v-expand-transition>
        <div v-if="hasActiveFilters" class="mt-4">
          <v-divider class="mb-3" />
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" size="small" color="primary">mdi-information</v-icon>
            <span class="text-subtitle-2 font-weight-medium">Filtros Ativos:</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-if="filtros.categoriaId"
              color="primary"
              size="small"
              closable
              @click:close="removeFiltro('categoriaId')"
            >
              <v-icon start size="small">mdi-tag</v-icon>
              {{ getCategoriaNome(filtros.categoriaId) }}
            </v-chip>
            
            <v-chip
              v-if="filtros.tipoMovimentacao"
              color="success"
              size="small"
              closable
              @click:close="removeFiltro('tipoMovimentacao')"
            >
              <v-icon start size="small">mdi-swap-horizontal</v-icon>
              {{ getTipoMovimentacaoNome(filtros.tipoMovimentacao) }}
            </v-chip>
            
            <v-chip
              v-if="filtros.usuarioId"
              color="info"
              size="small"
              closable
              @click:close="removeFiltro('usuarioId')"
            >
              <v-icon start size="small">mdi-account</v-icon>
              {{ getUsuarioNome(filtros.usuarioId) }}
            </v-chip>
            
            <v-chip
              v-if="filtros.dataInicio || filtros.dataFim"
              color="warning"
              size="small"
              closable
              @click:close="removeFiltro('dataInicio'); removeFiltro('dataFim')"
            >
              <v-icon start size="small">mdi-calendar-range</v-icon>
              {{ getPeriodoTexto() }}
            </v-chip>
            
            <v-chip
              v-if="filtros.statusLote"
              color="error"
              size="small"
              closable
              @click:close="removeFiltro('statusLote')"
            >
              <v-icon start size="small">mdi-package-variant</v-icon>
              {{ getStatusLoteNome(filtros.statusLote) }}
            </v-chip>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CategoryService, UserService } from '@/services'

// Props
interface FiltrosRelatoriosProps {
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<FiltrosRelatoriosProps>(), {
  modelValue: () => ({}),
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'filtros-change': [filtros: Record<string, any>]
}>()

// Dados
const categorias = ref<any[]>([])
const usuarios = ref<any[]>([])

// Filtros
const filtros = ref({
  categoriaId: null as number | null,
  tipoMovimentacao: null as string | null,
  usuarioId: null as number | null,
  dataInicio: null as string | null,
  dataFim: null as string | null,
  statusLote: null as string | null,
})

// Opções para selects
const tiposMovimentacao = [
  { text: 'Entrada', value: 'entrada' },
  { text: 'Saída', value: 'saida' },
]

const statusLote = [
  { text: 'Válido', value: 'valido' },
  { text: 'Próximo ao Vencimento', value: 'proximo_vencimento' },
  { text: 'Vencido', value: 'vencido' },
  { text: 'Estoque Baixo', value: 'estoque_baixo' },
]

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filtros.value).some(value => value !== null && value !== '')
})

// Métodos
const loadData = async () => {
  try {
    // Carregar categorias
    const categoriasData = await CategoryService.getAll()
    categorias.value = categoriasData

    // Carregar usuários
    const usuariosData = await UserService.getAll()
    usuarios.value = usuariosData
  } catch (error) {
    console.error('Erro ao carregar dados dos filtros:', error)
  }
}

const onFiltroChange = () => {
  emit('update:modelValue', { ...filtros.value })
  emit('filtros-change', { ...filtros.value })
}

const clearFilters = () => {
  filtros.value = {
    categoriaId: null,
    tipoMovimentacao: null,
    usuarioId: null,
    dataInicio: null,
    dataFim: null,
    statusLote: null,
  }
  onFiltroChange()
}

const removeFiltro = (key: string) => {
  if (key === 'dataInicio' || key === 'dataFim') {
    filtros.value.dataInicio = null
    filtros.value.dataFim = null
  } else {
    (filtros.value as any)[key] = null
  }
  onFiltroChange()
}

// Helpers para exibir nomes nos chips
const getCategoriaNome = (id: number) => {
  const categoria = categorias.value.find(c => c.id === id)
  return categoria?.nome || 'Categoria'
}

const getTipoMovimentacaoNome = (tipo: string) => {
  const item = tiposMovimentacao.find(t => t.value === tipo)
  return item?.text || tipo
}

const getUsuarioNome = (id: number) => {
  const usuario = usuarios.value.find(u => u.id === id)
  return usuario?.nome || 'Usuário'
}

const getStatusLoteNome = (status: string) => {
  const item = statusLote.find(s => s.value === status)
  return item?.text || status
}

const getPeriodoTexto = () => {
  const inicio = filtros.value.dataInicio
  const fim = filtros.value.dataFim
  
  if (inicio && fim) {
    return `${inicio} - ${fim}`
  } else if (inicio) {
    return `A partir de ${inicio}`
  } else if (fim) {
    return `Até ${fim}`
  }
  return 'Período'
}

// Watch para sincronizar com props
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    filtros.value = { ...filtros.value, ...newValue }
  }
}, { deep: true, immediate: true })

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.filtros-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filtros-header {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  color: #ffffff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}

/* Estilo para os campos de filtro */
:deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-field__input) {
  color: #ffffff !important;
}

:deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-field--focused .v-label) {
  color: #9C4ED6 !important;
}

:deep(.v-field--focused .v-field__outline) {
  color: #9C4ED6 !important;
}

/* Chips de filtros ativos */
:deep(.v-chip) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}
</style>
