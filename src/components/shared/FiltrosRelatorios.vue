<template>
  <v-card class="filtros-card" elevation="2" rounded="xl">
    <v-card-title class="filtros-header">
      <v-icon class="mr-2" color="primary">mdi-filter-variant</v-icon>
      <span class="font-weight-bold">Filtros de Relatórios</span>
      <v-spacer />
      <v-btn
        v-if="hasActiveFilters"
        color="error"
        prepend-icon="mdi-close"
        size="small"
        variant="text"
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
            clearable
            density="comfortable"
            item-title="nome"
            item-value="id"
            :items="categorias"
            label="Categoria"
            :loading="loading"
            placeholder="Selecione uma categoria"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
          />
        </v-col>

        <!-- Filtro por Tipo de Movimentação -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filtros.tipoMovimentacao"
            clearable
            density="comfortable"
            item-title="text"
            item-value="value"
            :items="tiposMovimentacao"
            label="Tipo de Movimentação"
            placeholder="Selecione o tipo"
            prepend-inner-icon="mdi-swap-horizontal"
            variant="outlined"
          />
        </v-col>

        <!-- Filtro por Usuário -->
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filtros.usuarioId"
            clearable
            density="comfortable"
            item-title="nome"
            item-value="id"
            :items="usuarios"
            label="Usuário"
            :loading="loading"
            placeholder="Selecione um usuário"
            prepend-inner-icon="mdi-account"
            variant="outlined"
          />
        </v-col>

        <!-- Filtro por Período -->
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.dataInicio"
                density="comfortable"
                label="Data Início"
                prepend-inner-icon="mdi-calendar-start"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="filtros.dataFim"
                density="comfortable"
                label="Data Fim"
                prepend-inner-icon="mdi-calendar-end"
                type="date"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Filtro por Status do Lote -->
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="filtros.statusLote"
            clearable
            density="comfortable"
            item-title="text"
            item-value="value"
            :items="statusLote"
            label="Status do Lote"
            placeholder="Selecione o status"
            prepend-inner-icon="mdi-package-variant"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <!-- Botões de Ação -->
      <v-row class="mt-4">
        <v-col class="d-flex justify-end gap-3" cols="12">
          <v-btn
            v-if="hasActiveFilters"
            color="grey-darken-1"
            prepend-icon="mdi-close"
            variant="outlined"
            @click="clearFilters"
          >
            Limpar
          </v-btn>
          <v-btn
            color="primary"
            :loading="buscando"
            prepend-icon="mdi-magnify"
            size="large"
            variant="elevated"
            @click="aplicarFiltros"
          >
            Buscar
          </v-btn>
        </v-col>
      </v-row>

      <!-- Resumo dos Filtros Ativos -->
      <v-expand-transition>
        <div v-if="hasActiveFilters" class="mt-4">
          <v-divider class="mb-3" />
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" color="primary" size="small">mdi-information</v-icon>
            <span class="text-subtitle-2 font-weight-medium">Filtros Ativos:</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-if="filtros.categoriaId"
              closable
              color="primary"
              size="small"
              @click:close="removeFiltro('categoriaId')"
            >
              <v-icon size="small" start>mdi-tag</v-icon>
              {{ getCategoriaNome(filtros.categoriaId) }}
            </v-chip>

            <v-chip
              v-if="filtros.tipoMovimentacao"
              closable
              color="success"
              size="small"
              @click:close="removeFiltro('tipoMovimentacao')"
            >
              <v-icon size="small" start>mdi-swap-horizontal</v-icon>
              {{ getTipoMovimentacaoNome(filtros.tipoMovimentacao) }}
            </v-chip>

            <v-chip
              v-if="filtros.usuarioId"
              closable
              color="info"
              size="small"
              @click:close="removeFiltro('usuarioId')"
            >
              <v-icon size="small" start>mdi-account</v-icon>
              {{ getUsuarioNome(filtros.usuarioId) }}
            </v-chip>

            <v-chip
              v-if="filtros.dataInicio || filtros.dataFim"
              closable
              color="warning"
              size="small"
              @click:close="removeFiltro('dataInicio'); removeFiltro('dataFim')"
            >
              <v-icon size="small" start>mdi-calendar-range</v-icon>
              {{ getPeriodoTexto() }}
            </v-chip>

            <v-chip
              v-if="filtros.statusLote"
              closable
              color="error"
              size="small"
              @click:close="removeFiltro('statusLote')"
            >
              <v-icon size="small" start>mdi-package-variant</v-icon>
              {{ getStatusLoteNome(filtros.statusLote) }}
            </v-chip>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { CategoryService, UserService } from '@/services'

  export interface FiltrosData {
    categoriaId: number | null
    tipoMovimentacao: string | null
    usuarioId: number | null
    dataInicio: string | null
    dataFim: string | null
    statusLote: string | null
  }

  export default defineComponent({
    name: 'FiltrosRelatorios',
    props: {
      modelValue: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ['update:modelValue', 'filtros-change', 'aplicar-filtros'],
    data () {
      return {
        categorias: [] as any[],
        usuarios: [] as any[],
        loading: false,
        buscando: false,
        filtros: {
          categoriaId: null as number | null,
          tipoMovimentacao: null as string | null,
          usuarioId: null as number | null,
          dataInicio: null as string | null,
          dataFim: null as string | null,
          statusLote: null as string | null,
        } as FiltrosData,
        tiposMovimentacao: [
          { text: 'Entrada', value: 'entrada' },
          { text: 'Saída', value: 'saida' },
        ],
        statusLote: [
          { text: 'Válido', value: 'valido' },
          { text: 'Próximo ao Vencimento', value: 'proximo_vencimento' },
          { text: 'Vencido', value: 'vencido' },
          { text: 'Estoque Baixo', value: 'estoque_baixo' },
        ],
      }
    },
    computed: {
      hasActiveFilters (): boolean {
        return Object.values(this.filtros).some(value => value !== null && value !== '')
      },
    },
    watch: {
      modelValue: {
        handler (newValue: Record<string, any>) {
          if (newValue) {
            this.filtros = { ...this.filtros, ...newValue }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted () {
      this.loadData()
    },
    methods: {
      async loadData () {
        this.loading = true
        try {
          const categoriasData = await CategoryService.getAll()
          this.categorias = categoriasData

          const usuariosData = await UserService.getAll()
          this.usuarios = usuariosData
        } catch (error) {
          console.error('Erro ao carregar dados dos filtros:', error)
        } finally {
          this.loading = false
        }
      },
      aplicarFiltros () {
        this.buscando = true
        this.$emit('update:modelValue', { ...this.filtros })
        this.$emit('filtros-change', { ...this.filtros })
        this.$emit('aplicar-filtros', { ...this.filtros })

        setTimeout(() => {
          this.buscando = false
        }, 500)
      },
      clearFilters () {
        this.filtros = {
          categoriaId: null,
          tipoMovimentacao: null,
          usuarioId: null,
          dataInicio: null,
          dataFim: null,
          statusLote: null,
        }
        this.aplicarFiltros()
      },
      removeFiltro (key: string) {
        if (key === 'dataInicio' || key === 'dataFim') {
          this.filtros.dataInicio = null
          this.filtros.dataFim = null
        } else {
          (this.filtros as any)[key] = null
        }
        this.aplicarFiltros()
      },
      getCategoriaNome (id: number): string {
        const categoria = this.categorias.find(c => c.id === id)
        return categoria?.nome || 'Categoria'
      },
      getTipoMovimentacaoNome (tipo: string): string {
        const item = this.tiposMovimentacao.find(t => t.value === tipo)
        return item?.text || tipo
      },
      getUsuarioNome (id: number): string {
        const usuario = this.usuarios.find(u => u.id === id)
        return usuario?.nome || 'Usuário'
      },
      getStatusLoteNome (status: string): string {
        const item = this.statusLote.find(s => s.value === status)
        return item?.text || status
      },
      getPeriodoTexto (): string {
        const inicio = this.filtros.dataInicio
        const fim = this.filtros.dataFim

        if (inicio && fim) {
          return `${inicio} - ${fim}`
        } else if (inicio) {
          return `A partir de ${inicio}`
        } else if (fim) {
          return `Até ${fim}`
        }
        return 'Período'
      },
    },
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

.gap-3 {
  gap: 0.75rem;
}

:deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s ease;
}

:deep(.v-field:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
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

:deep(.v-field--focused) {
  background: rgba(156, 78, 214, 0.1) !important;
  border-color: #9C4ED6 !important;
}

:deep(.v-chip) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

:deep(.v-btn) {
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
