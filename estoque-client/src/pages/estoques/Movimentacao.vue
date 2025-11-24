<template>
  <div class="movimentacao-page">
    <v-container class="pa-6" fluid>
      <!-- Header -->
      <MovimentacaoHeader
        @open-entrada-dialog="openDialog('entrada')"
        @open-saida-dialog="openDialog('saida')"
      />

      <!-- Filters and Table -->
      <MovimentacaoTable
        :movements="movements"
        :loading="loading"
        :search="search"
        :filter-type="filterType"
        :filter-date="filterDate"
        @refresh="loadMovements"
        @view-movement="viewMovement"
        @update:search="search = $event"
        @update:filterType="filterType = $event"
        @update:filterDate="filterDate = $event"
      />
    </v-container>

    <!-- Create Movement Dialog -->
    <CreateMovementDialog
      ref="createDialogRef"
      v-model="createDialog"
      :dialog-type="dialogType"
      :form-data="formData"
      :products="products"
      :lotes="lotes"
      :locations="locations"
      :selected-product="selectedProduct"
      :selected-lote="selectedLote"
      :usar-novo-lote="usarNovoLote"
      :novo-lote="novoLote"
      :saving="saving"
      @update:formData="formData = $event"
      @update:novoLote="novoLote = $event"
      @cancel="cancelCreate"
      @save="saveMovement"
      @product-change="onProductChange"
      @lote-change="onLoteChange"
    />

    <!-- View Movement Dialog -->
    <ViewMovementDialog
      v-model="viewDialog"
      :movement="selectedMovement"
    />

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      elevation="8"
      location="top right"
      :timeout="snackbarTimeout"
    >
      <div class="d-flex align-center">
        <v-icon
          class="mr-2"
          :icon="snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
        />
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
  import type { MovementDisplay, MovementFormData, MovementType, Product, ProductLote, StockMovementEnriched } from '@/interfaces'
  import type { VForm } from '@/interfaces/ui/form'
import type { CreateLoteInput, LocationComplete } from '@/services'
import { getStoredUser } from '@/services'
  import { useAuthStore } from '@/stores/auth'
  import { useDataCacheStore } from '@/stores/dataCache'
  import { snackbarMixin } from '@/utils/snackbar'

  type MovementFormDataExtended = Omit<MovementFormData, 'id_lote'> & { id_lote: number | 'novo' | null }

  export default defineComponent({
    name: 'MovimentacaoPage',
    mixins: [snackbarMixin],
    setup () {
      const authStore = useAuthStore()
      const dataCache = useDataCacheStore()
      return { authStore, dataCache }
    },
    data () {
      return {
        loading: false,
        saving: false,
        createDialog: false,
        viewDialog: false,
        validForm: false,
        dialogType: 'entrada' as MovementType,
        search: '',
        filterType: 'Todos',
        filterDate: '',
        movements: [] as MovementDisplay[],
        products: [] as Product[],
        lotes: [] as ProductLote[],
        locations: [] as LocationComplete[],
        selectedMovement: null as MovementDisplay | null,
        selectedProduct: null as Product | null,
        selectedLote: null as ProductLote | null,
        formData: {
          id_produto: null,
          id_lote: null as number | 'novo' | null,
          quantidade: 0,
          preco_unitario: 0,
          observacao: '',
          id_localizacao: null,
          id_localizacao_origem: null,
          id_localizacao_destino: null,
        } as MovementFormDataExtended,
        createDialogRef: null as any,
        usarNovoLote: false,
        novoLote: {
          data_validade: '',
        },
      }
    },
    async mounted () {
      await this.loadData()
    },
    methods: {
      async loadData (forceRefresh = false) {
        // Verifica se já tem dados no cache
        const cachedMovements = this.dataCache.getMovements()
        const cachedProducts = this.dataCache.getProducts()
        const cachedLotes = this.dataCache.getLotes()
        const cachedLocations = this.dataCache.getLocations()

       
        if (!forceRefresh && cachedMovements && cachedProducts && cachedLotes) {
          this.movements = cachedMovements
          this.products = cachedProducts
          this.lotes = cachedLotes
          
          // Localizações podem variar por UF, então sempre verifica
          if (cachedLocations) {
            this.locations = cachedLocations
          } else {
            await this.loadLocations(forceRefresh)
          }
          return
        }

       
        this.loading = true
        try {
          await Promise.all([
            this.loadMovements(forceRefresh),
            this.loadProducts(forceRefresh),
            this.loadLotes(forceRefresh),
            this.loadLocations(forceRefresh),
          ])
        } finally {
          this.loading = false
        }
      },
      formatBRLFromCents (cents: number): string {
        const value = (cents / 100).toFixed(2)
        const [ints = '0', decs = '00'] = value.split('.')
        const intsFormatted = ints.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return `${intsFormatted},${decs}`
      },

      async loadMovements (forceRefresh = false) {
        try {
          this.movements = await this.dataCache.fetchMovements(forceRefresh)
        } catch (error: any) {
          console.error('Erro ao carregar movimentações:', error)
          const message = error?.response?.data?.message || error?.message || 'Erro desconhecido'
          this.showError(`Erro ao carregar movimentações: ${message}`)
        }
      },
      async loadProducts (forceRefresh = false) {
        try {
          this.products = await this.dataCache.fetchProducts(forceRefresh)
        } catch (error: any) {
          console.error('Erro ao carregar produtos:', error)
          const message = error?.response?.data?.message || error?.message || 'Erro desconhecido'
          this.showError(`Erro ao carregar produtos: ${message}`)
        }
      },
      async loadLotes (forceRefresh = false) {
        try {
          this.lotes = await this.dataCache.fetchLotes(forceRefresh)
        } catch (error: any) {
          console.error('Erro ao carregar lotes:', error)
          const message = error?.response?.data?.message || error?.message || 'Erro desconhecido'
          this.showError(`Erro ao carregar lotes: ${message}`)
        }
      },
      async loadLocations (forceRefresh = false) {
        try {
          const { LocationService } = await import('@/services')
          const cached = this.dataCache.getLocations()
          if (!forceRefresh && cached) {
            this.locations = cached
            return
          }
          this.locations = await this.dataCache.fetchLocations(null, forceRefresh)
        } catch (error: any) {
          console.error('Erro ao carregar localizações:', error)
          const message = error?.response?.data?.message || error?.message || 'Erro desconhecido'
          this.showError(`Erro ao carregar localizações: ${message}`)
        }
      },
      openDialog (type: MovementType) {
        this.dialogType = type
        this.createDialog = true
        this.resetForm()
      },
      resetForm () {
        this.formData = {
          id_produto: null,
          id_lote: null,
          quantidade: 0,
          preco_unitario: 0,
          observacao: '',
          id_localizacao: null,
          id_localizacao_origem: null,
          id_localizacao_destino: null,
        } as MovementFormDataExtended
        this.selectedProduct = null
        this.selectedLote = null
        this.usarNovoLote = false
        this.novoLote = {
          data_validade: '',
        }
      },
      cancelCreate () {
        this.createDialog = false
        this.resetForm()
      },
      onProductChange (productId: number) {
        this.selectedProduct = this.products.find((p: Product) => p.id === productId) || null
        this.formData.id_lote = null
        this.selectedLote = null

        if (this.dialogType === 'entrada') {
          const hasLotes = this.lotes.some((l: ProductLote) => l.id_produto === productId && (l.quantidade ?? 0) > 0)
          this.usarNovoLote = !hasLotes
          this.formData.id_lote = this.usarNovoLote ? 'novo' : null
        } else {
          this.usarNovoLote = false
        }
      },
      onLoteChange (loteId: number | 'novo' | null) {
        if (loteId === 'novo') {
          this.usarNovoLote = true
          this.selectedLote = null
          return
        }

        this.usarNovoLote = false
        this.selectedLote = loteId
          ? this.lotes.find((l: ProductLote) => l.id === loteId) || null
          : null

        
        if (this.selectedLote && this.dialogType === 'saida') {
          const custoUnitario = this.selectedLote.custo_unitario
          if (custoUnitario) {
            this.formData.preco_unitario = custoUnitario
          }
          this.formData.id_localizacao_origem = this.selectedLote.id_localizacao ?? null
        }
      },
      async saveMovement (formData?: MovementFormDataExtended) {
        const data = formData || this.formData
        if (!data.id_produto) {
          this.showError('Selecione um produto para continuar')
          return
        }

        const validation = await this.createDialogRef?.validate?.()
        if (validation && !validation.valid) {
          return
        }

        this.saving = true
        try {
          const storedUser = getStoredUser()
          const idUsuario = storedUser?.id ?? 1

          let loteId: number | null = typeof data.id_lote === 'number'
            ? data.id_lote
            : null

          if (this.dialogType === 'entrada' && (this.usarNovoLote || data.id_lote === 'novo' || !loteId)) {
            if (!data.id_localizacao_destino) {
              this.showError('Informe a localização de destino para criar o lote')
              this.saving = false
              return
            }
            if (data.quantidade <= 0) {
              this.showError('Quantidade deve ser maior que zero')
              this.saving = false
              return
            }

            const payload: CreateLoteInput = {
              id_produto: data.id_produto,
              codigo_lote: undefined,
              data_validade: this.novoLote.data_validade || undefined,
              quantidade: data.quantidade,
              data_entrada: new Date().toISOString().slice(0, 10),
              responsavel_cadastro: idUsuario,
              usuario_log_id: idUsuario,
              id_localizacao: data.id_localizacao_destino ?? undefined,
              custo_unitario: data.preco_unitario || undefined,
              ativo: true,
            }

            const { LoteService } = await import('@/services')
            const novoLoteCriado = await LoteService.create(payload)
            loteId = novoLoteCriado.id
            this.lotes.push(novoLoteCriado)
            this.formData.id_lote = loteId
            this.usarNovoLote = false
          }

          if (!loteId) {
            this.showError('Selecione um lote para continuar')
            this.saving = false
            return
          }

          const idLocalizacao = this.dialogType === 'entrada'
            ? data.id_localizacao_destino
            : data.id_localizacao_origem

          const { MovementService } = await import('@/services')
          await MovementService.create({
            id_produto: data.id_produto,
            id_lote: loteId,
            id_usuario: idUsuario,
            quantidade: data.quantidade,
            tipo_movimento: this.dialogType,
            preco_unitario: data.preco_unitario || undefined,
            observacao: data.observacao?.trim() || undefined,
            id_localizacao: idLocalizacao ?? null,
            id_localizacao_origem: data.id_localizacao_origem ?? null,
            id_localizacao_destino: data.id_localizacao_destino ?? null,
            usuario_log_id: idUsuario,
          })

          // Invalida cache após criar movimentação
          this.dataCache.invalidateAfterMutation('movement')
          if (this.usarNovoLote || data.id_lote === 'novo') {
            this.dataCache.invalidateAfterMutation('lote')
          }

          this.showSuccess(
            `${this.dialogType === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
          )

          this.createDialog = false
          this.resetForm()
          await this.loadMovements(true) // Força refresh após salvar
        } catch (error) {
          console.error('Erro ao salvar movimentação:', error)
          this.showError('Erro ao salvar movimentação')
        } finally {
          this.saving = false
        }
      },
      viewMovement (movement: MovementDisplay) {
        this.selectedMovement = movement
        this.viewDialog = true
      },
    },
  })
</script>

<style scoped>
.movimentacao-page {
  background: #000000;
  min-height: 100vh;
}

</style>

<route lang="yaml">
meta:
  layout: default
</route>
