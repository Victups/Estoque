<template>
  <div class="produtos-page">
    <v-container class="pa-6" fluid>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" color="primary" icon="mdi-package-variant" size="28" />
              <h1 class="text-h5 font-weight-bold mb-0">
                Gerenciamento de Produtos
              </h1>
            </div>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Gerencie todos os produtos e estoque do sistema
            </p>
          </div>
          <div>
            <v-btn
              color="primary"
              prepend-icon="mdi-package-variant-plus"
              :to="{ name: 'CadastroProdutos' }"
              variant="elevated"
            >
              Cadastrar Produto
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Content -->
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="2">
          <v-card-text class="pa-6">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular color="primary" indeterminate size="64" />
              <p class="text-subtitle-1 mt-4">
                Carregando produtos...
              </p>
            </div>

            <!-- Error State -->
            <v-alert
              v-if="error"
              class="mb-4"
              closable
              type="error"
              variant="tonal"
            >
              {{ error }}
            </v-alert>

            <!-- Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="filters.filtro"
                  clearable
                  density="comfortable"
                  hide-details
                  label="Buscar produto"
                  placeholder="Nome do produto..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  @update:model-value="onFilterChange()"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.status"
                  clearable
                  density="comfortable"
                  hide-details
                  :items="statusOptions"
                  label="Status"
                  prepend-inner-icon="mdi-filter"
                  variant="outlined"
                  @update:model-value="onFilterChange()"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.id_categoria"
                  clearable
                  density="comfortable"
                  hide-details
                  :items="categoriasOptions"
                  item-title="nome"
                  item-value="id"
                  label="Categoria"
                  prepend-inner-icon="mdi-tag"
                  variant="outlined"
                  @update:model-value="onFilterChange()"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.id_marca"
                  clearable
                  density="comfortable"
                  hide-details
                  :items="marcasOptions"
                  item-title="nome"
                  item-value="id"
                  label="Marca"
                  prepend-inner-icon="mdi-label"
                  variant="outlined"
                  @update:model-value="onFilterChange()"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="filters.preco_min"
                      clearable
                      density="comfortable"
                      hide-details
                      label="Preço Mín"
                      placeholder="0.00"
                      prefix="R$"
                      type="number"
                      variant="outlined"
                      @update:model-value="onFilterChange()"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="filters.preco_max"
                      clearable
                      density="comfortable"
                      hide-details
                      label="Preço Máx"
                      placeholder="0.00"
                      prefix="R$"
                      type="number"
                      variant="outlined"
                      @update:model-value="onFilterChange()"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Products Table -->
            <v-data-table
              v-if="!loading && !error"
              class="elevation-1 rounded-lg"
              :headers="headers"
              :items="displayProducts"
              :items-per-page="filters.tamanho"
              :items-per-page-options="[10, 20, 30, 50]"
              :items-length="paginationData.total"
              :page="filters.pagina"
              items-per-page-text="Produtos por página"
              :loading="loading"
              loading-text="Carregando produtos..."
              no-data-text="Nenhum produto encontrado"
              server-items-length
              @update:page="onPageChange"
              @update:items-per-page="onItemsPerPageChange"
            >
              <!-- Product Name -->
              <template #[`item.nome`]="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar class="mr-3" color="primary" size="40">
                    <v-icon>mdi-package-variant</v-icon>
                  </v-avatar>
                  <span class="font-weight-medium">{{ item.nome }}</span>
                </div>
              </template>

              <!-- Total Quantity -->
              <template #[`item.totalQuantity`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2 text-medium-emphasis" icon="mdi-package-variant-closed" size="small" />
                  <span class="font-weight-medium">{{ item.totalQuantity }}</span>
                </div>
              </template>

              <!-- Nearest Expiry -->
              <template #[`item.nearestExpiry`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2 text-medium-emphasis" icon="mdi-calendar" size="small" />
                  <span>{{ item.nearestExpiry }}</span>
                </div>
              </template>

              <!-- Status -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  <v-icon
                    :icon="getStatusIcon(item.status)"
                    size="small"
                    start
                  />
                  {{ item.status }}
                </v-chip>
              </template>

              <template #[`item.actions`]="{ item }">
                <div class="d-flex align-center gap-2">
                  <v-tooltip location="top" text="Ver detalhes">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="info"
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        @click.stop="openDetails(item)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip location="top" text="Editar produto">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="primary"
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click.stop="editProduct(item)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip location="top" text="Excluir produto">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="error"
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        @click.stop="confirmDelete(item)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </template>

              <!-- Loading Template -->
              <template #loading>
                <v-skeleton-loader type="table-row@5" />
              </template>
            </v-data-table>

            <!-- Detalhes do Produto -->
            <v-dialog v-model="detailDialog" max-width="720">
              <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                    Detalhes do Produto
                  </div>
                  <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
                </v-card-title>
                <v-card-text>
                  <v-progress-linear
                    v-if="detailLoading"
                    class="mb-4"
                    color="primary"
                    indeterminate
                  />
                  <div v-else-if="selectedProductDetail">
                    <v-row>
                      <v-col cols="12" md="6">
                        <h4 class="text-subtitle-2 text-grey">Informações Gerais</h4>
                        <p class="mb-1"><strong>Nome:</strong> {{ selectedProductDetail.nome }}</p>
                        <p class="mb-1"><strong>Código:</strong> {{ selectedProductDetail.codigo }}</p>
                        <p class="mb-1"><strong>Descrição:</strong> {{ selectedProductDetail.descricao || '-' }}</p>
                        <p class="mb-1"><strong>Categoria:</strong> {{ selectedProductDetail.categoria_nome || '-' }}</p>
                        <p class="mb-1"><strong>Marca:</strong> {{ selectedProductDetail.marca_nome || '-' }}</p>
                        <p class="mb-1">
                          <strong>Unidade:</strong>
                          {{ selectedProductDetail.unidade_descricao || '-' }}
                          <span v-if="selectedProductDetail.unidade_abreviacao">
                            ({{ selectedProductDetail.unidade_abreviacao }})
                          </span>
                        </p>
                      </v-col>
                      <v-col cols="12" md="6">
                        <h4 class="text-subtitle-2 text-grey">Auditoria</h4>
                        <p class="mb-1"><strong>Responsável cadastro:</strong> {{ selectedProductDetail.responsavel_nome || '-' }}</p>
                        <p class="mb-1"><strong>Último usuário:</strong> {{ selectedProductDetail.usuario_log_nome || '-' }}</p>
                        <p class="mb-1"><strong>Criado em:</strong> {{ formatDate(selectedProductDetail.created_at) }}</p>
                        <p class="mb-1"><strong>Atualizado em:</strong> {{ formatDate(selectedProductDetail.updated_at) }}</p>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <h4 class="text-subtitle-2 text-grey mb-2">Fornecedores Vinculados</h4>
                    <div v-if="selectedProductDetail.fornecedores?.length" class="d-flex flex-wrap gap-2 mb-4">
                      <v-chip
                        v-for="fornecedor in selectedProductDetail.fornecedores"
                        :key="fornecedor.id_fornecedor"
                        color="primary"
                        size="small"
                        variant="tonal"
                      >
                        {{ fornecedor.nome }}
                      </v-chip>
                    </div>
                    <p v-else class="text-grey mb-4">Nenhum fornecedor vinculado.</p>

                    <h4 class="text-subtitle-2 text-grey mb-2">Lotes cadastrados</h4>
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Quantidade</th>
                          <th>Validade</th>
                          <th>Localização</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="lote in selectedProductDetail.lotes" :key="lote.id">
                          <td>{{ lote.codigo_lote }}</td>
                          <td>{{ lote.quantidade }}</td>
                          <td>{{ lote.data_validade ? formatDate(lote.data_validade) : '-' }}</td>
                          <td>{{ lote.id_localizacao || '-' }}</td>
                        </tr>
                        <tr v-if="!selectedProductDetail.lotes?.length">
                          <td class="text-grey" colspan="4">Sem lotes registrados.</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                  <div v-else class="text-center text-grey">
                    Nenhuma informação disponível.
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="primary" variant="text" @click="detailDialog = false">
                    Fechar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Confirmação de Exclusão -->
            <v-dialog v-model="deleteDialog" max-width="480">
              <v-card>
                <v-card-title class="text-h6">
                  Confirmar exclusão
                </v-card-title>
                <v-card-text>
                  Deseja realmente excluir o produto
                  <strong>{{ productToDelete?.nome }}</strong>? Esta ação não poderá ser desfeita.
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="grey" variant="text" @click="deleteDialog = false">
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="error"
                    :loading="deleteLoading"
                    variant="elevated"
                    @click="deleteProduct"
                  >
                    Excluir
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top right"
      :timeout="snackbarTimeout"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2" :icon="snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" />
        {{ snackbarText }}
      </div>
    </v-snackbar>
    </v-container>
  </div>
</template>

<script>
  import { useDataCacheStore } from '@/stores/dataCache'
  import { snackbarMixin } from '@/utils/snackbar'
  import { ProductService } from '@/services'

  export default {
    name: 'ProdutosPage',
    mixins: [snackbarMixin],
    setup () {
      const dataCache = useDataCacheStore()
      return { dataCache }
    },
    data () {
      return {
        allProducts: [],
        allProductLots: [],
        categorias: [],
        marcas: [],
        loading: false,
        error: null,
        filters: {
          filtro: '',
          status: undefined,
          id_categoria: undefined,
          id_marca: undefined,
          preco_min: undefined,
          preco_max: undefined,
          pagina: 1,
          tamanho: 20,
        },
        statusOptions: [
          { title: 'Ativo', value: 'ativo' },
          { title: 'Inativo', value: 'inativo' },
        ],
        headers: [
          { title: 'Produto', key: 'nome', sortable: true },
          { title: 'Estoque Total', key: 'totalQuantity', sortable: true },
          { title: 'Validade Próxima', key: 'nearestExpiry', sortable: false },
          { title: 'Status', key: 'status', sortable: true },
          { title: 'Ações', key: 'actions', sortable: false, width: '140px' },
        ],
        detailDialog: false,
        detailLoading: false,
        selectedProductDetail: null,
        deleteDialog: false,
        deleteLoading: false,
        productToDelete: null,
        paginationData: {
          total: 0,
          pagina: 1,
          totalPaginas: 0,
        },
      }
    },
    computed: {
      categoriasOptions () {
        return this.categorias.map(cat => ({ id: cat.id, nome: cat.nome }))
      },
      marcasOptions () {
        return this.marcas.map(marca => ({ id: marca.id, nome: marca.nome }))
      },
      displayProducts () {
        const lotMap = new Map()
        for (const lot of this.allProductLots) {
          const lots = lotMap.get(lot.id_produto) || []
          lots.push(lot)
          lotMap.set(lot.id_produto, lots)
        }

        return this.allProducts.map(product => {
          const lots = lotMap.get(product.id) || []
          const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantidade, 0)
          const validLots = lots.filter(lot => new Date(lot.data_validade) > new Date())
          const sortedLots = validLots.toSorted((a, b) => new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime())
          const nearestExpiryLot = sortedLots[0]
          const nearestExpiry = nearestExpiryLot ? new Date(nearestExpiryLot.data_validade).toLocaleDateString('pt-BR') : 'N/A'

          let status = 'OK'
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

          if (totalQuantity < product.estoque_minimo) {
            status = 'Estoque Baixo'
          } else if (nearestExpiryLot && new Date(nearestExpiryLot.data_validade) < thirtyDaysFromNow) {
            status = 'Vencimento Próximo'
          }

          return {
            id: product.id,
            nome: product.nome,
            totalQuantity,
            nearestExpiry,
            status,
          }
        })
      },
    },
    mounted () {
      this.loadData()
    },
    methods: {
      onFilterChange () {
        // Quando um filtro muda, volta para a primeira página
        this.filters.pagina = 1
        this.loadData()
      },
      onPageChange (newPage) {
        // Quando a página muda na tabela, atualiza e faz requisição ao backend
        console.log('📄 Mudando de página:', this.filters.pagina, '→', newPage)
        this.filters.pagina = newPage
        this.loadData()
      },
      onItemsPerPageChange (newItemsPerPage) {
        // Quando o tamanho da página muda na tabela, atualiza e faz requisição ao backend
        console.log('📏 Mudando tamanho da página:', this.filters.tamanho, '→', newItemsPerPage)
        this.filters.tamanho = newItemsPerPage
        this.filters.pagina = 1 // Volta para a primeira página
        this.loadData()
      },
      async loadData (forceRefresh = false) {
        this.loading = true
        this.error = null

        try {
          // Carrega categorias e marcas se necessário
          if (this.categorias.length === 0 || forceRefresh) {
            this.categorias = await this.dataCache.fetchCategories(forceRefresh)
          }
          if (this.marcas.length === 0 || forceRefresh) {
            const { BrandService } = await import('@/services')
            this.marcas = await BrandService.getAll()
          }

          // Carrega lotes se necessário (para cálculos de estoque)
          if (this.allProductLots.length === 0 || forceRefresh) {
            this.allProductLots = await this.dataCache.fetchLotes(forceRefresh)
          }

          // Busca produtos com filtros do backend
          const filtersForBackend = {}

          if (this.filters.filtro) {
            filtersForBackend.filtro = this.filters.filtro
          }
          if (this.filters.status) {
            filtersForBackend.status = this.filters.status
          }
          if (this.filters.id_categoria) {
            filtersForBackend.id_categoria = this.filters.id_categoria
          }
          if (this.filters.id_marca) {
            filtersForBackend.id_marca = this.filters.id_marca
          }
          if (this.filters.preco_min !== undefined) {
            filtersForBackend.preco_min = this.filters.preco_min
          }
          if (this.filters.preco_max !== undefined) {
            filtersForBackend.preco_max = this.filters.preco_max
          }
          // Sempre envia página e tamanho para garantir paginação
          filtersForBackend.pagina = this.filters.pagina || 1
          filtersForBackend.tamanho = this.filters.tamanho || 20

          const result = await ProductService.getAllFiltered(filtersForBackend)
          this.allProducts = result.items
          
          // Atualiza dados de paginação
          if (result.total !== undefined && result.totalPaginas !== undefined) {
            // Sincroniza com os dados retornados do backend
            const paginaAtual = result.pagina || this.filters.pagina || 1
            
            this.paginationData = {
              total: result.total,
              pagina: paginaAtual,
              totalPaginas: result.totalPaginas,
            }
            
            // Sincroniza a página atual com o que foi retornado do backend
            // para garantir alinhamento
            if (this.filters.pagina !== paginaAtual) {
              this.filters.pagina = paginaAtual
            }
          } else {
            // Se não retornou paginação, assume que são todos os resultados
            this.paginationData = {
              total: result.items.length,
              pagina: 1,
              totalPaginas: 1,
            }
            if (this.filters.pagina !== 1) {
              this.filters.pagina = 1
            }
          }
        } catch (error_) {
          console.error('Erro ao carregar produtos:', error_)
          const errorMessage = error_?.response?.data?.message || error_?.message || 'Erro desconhecido'
          this.error = errorMessage
          this.showError(`Não foi possível carregar os produtos: ${errorMessage}`)
        } finally {
          this.loading = false
        }
      },
      
      getStatusColor (status) {
        switch (status) {
          case 'Estoque Baixo': {
            return 'warning'
          }
          case 'Vencimento Próximo': {
            return 'error'
          }
          default: {
            return 'success'
          }
        }
      },
      getStatusIcon (status) {
        switch (status) {
          case 'Estoque Baixo': {
            return 'mdi-alert-circle'
          }
          case 'Vencimento Próximo': {
            return 'mdi-clock-alert'
          }
          default: {
            return 'mdi-check-circle'
          }
        }
      },
      formatDate (value) {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return date.toLocaleString('pt-BR')
      },
      async openDetails (item) {
        this.detailDialog = true
        this.detailLoading = true
        this.selectedProductDetail = null
        try {
          const { ProductService } = await import('@/services')
          this.selectedProductDetail = await ProductService.getDetail(item.id)
        } catch (error_) {
          console.error('Erro ao carregar detalhes do produto:', error_)
          this.showError('Não foi possível carregar os detalhes do produto')
          this.detailDialog = false
        } finally {
          this.detailLoading = false
        }
      },
      editProduct (item) {
        this.$router.push({ name: 'EditarProduto', params: { id: item.id } })
      },
      confirmDelete (item) {
        this.productToDelete = item
        this.deleteDialog = true
      },
      async deleteProduct () {
        if (!this.productToDelete) return

        this.deleteLoading = true
        try {
          const { ProductService } = await import('@/services')
          await ProductService.delete(this.productToDelete.id)
          
          // Invalida o cache após deletar
          this.dataCache.invalidateAfterMutation('product')
          
          this.showSuccess('Produto excluído com sucesso')
          this.deleteDialog = false
          this.productToDelete = null
          await this.loadData(true) // Força refresh após deletar
        } catch (error_) {
          console.error('Erro ao excluir produto:', error_)
          this.showError('Erro ao excluir produto')
        } finally {
          this.deleteLoading = false
        }
      },
    },
  }
</script>

//remover
<route lang="yaml">
meta:
  layout: default
  requiresAuth: true
</route>

<style scoped>
.produtos-page {
  background: #000000;
  min-height: 100vh;
}

.v-card:not(:first-of-type) {
  background: #1a1a1a !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-card-title {
  color: #ffffff !important;
}

.v-data-table {
  border-radius: 8px;
  background: #1a1a1a !important;
}

:deep(.v-data-table__th) {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #ffffff !important;
  background: #2d2d2d !important;
}

:deep(.v-data-table__td) {
  font-size: 0.875rem;
  color: #ffffff !important;
}

:deep(.v-data-table tbody tr) {
  background: #1a1a1a !important;
}

:deep(.v-data-table tbody tr:hover) {
  background: #2d2d2d !important;
}
</style>
