<template>
  <div class="movimentacao-page">
    <v-container class="pa-6" fluid>
      <!-- Header -->
      <MovimentacaoHeader
        @open-entrada-dialog="openDialog('entrada')"
        @open-saida-dialog="openDialog('saida')"
      />

      <!-- Stats Cards -->
      <MovimentacaoStats
        :total-movements="movements.length"
        :entradas-count="entradasCount"
        :saidas-count="saidasCount"
        :hoje-mov="hojeMov"
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
  import type { MovementFormData, MovementType, Product, ProductLote, StockMovementEnriched } from '@/interfaces'
  import type { CreateLoteInput, LocationComplete } from '@/services'
  import { LocationService, LoteService, MovementService, ProductService } from '@/services'
  import { getStoredUser } from '@/services/auth.storage'
  import { useAuthStore } from '@/stores/auth'
  import { snackbarMixin } from '@/utils/snackbar'

 

  type MovementFormDataExtended = Omit<MovementFormData, 'id_lote'> & { id_lote: number | 'novo' | null }

  interface VForm {
    validate: () => Promise<{ valid: boolean }>
    reset: () => void
  }

  export default {
    name: 'MovimentacaoPage',
    mixins: [snackbarMixin],
    setup () {
      const authStore = useAuthStore()
      return { authStore }
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
        movements: [] as StockMovementEnriched[],
        products: [] as Product[],
        lotes: [] as ProductLote[],
        locations: [] as LocationComplete[],
        selectedMovement: null as StockMovementEnriched | null,
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
    computed: {
      entradasCount (): number {
        return this.movements.filter((m: StockMovementEnriched) => m.tipo_movimento === 'entrada').length
      },
      saidasCount (): number {
        return this.movements.filter((m: StockMovementEnriched) => m.tipo_movimento === 'saida').length
      },
      hojeMov (): number {
        const hoje = new Date().toISOString().split('T')[0]
        if (!hoje) return 0
        return this.movements.filter((m: StockMovementEnriched) =>
          m.data_mov.startsWith(hoje),
        ).length
      },
    },
    async mounted () {
      await Promise.all([
        this.loadMovements(),
        this.loadProducts(),
        this.loadLotes(),
        this.loadLocations(),
      ])
    },
    methods: {
      formatBRLFromCents (cents: number): string {
        const value = (cents / 100).toFixed(2)
        const [ints = '0', decs = '00'] = value.split('.')
        const intsFormatted = ints.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return `${intsFormatted},${decs}`
      },
      getErrorMessage (error: any): string {
        const errorData = error?.response?.data
        
        // Tenta extrair mensagem do backend primeiro
        if (errorData?.message) {
          return `Erro do servidor: ${errorData.message}`
        }
        
        if (errorData?.error) {
          // NestJS geralmente retorna erro assim: { statusCode: 500, message: "...", error: "..." }
          if (typeof errorData.message === 'string') {
            return `Erro do servidor: ${errorData.message}`
          }
          if (typeof errorData.error === 'string') {
            return `Erro: ${errorData.error}`
          }
        }
        
        // Mensagens genéricas por código de status
        if (error?.response?.status === 500) {
          return 'Erro interno do servidor. Verifique os logs do backend ou se o banco de dados está conectado.'
        }
        if (error?.response?.status === 404) {
          return 'Recurso não encontrado. Verifique a configuração da API.'
        }
        if (error?.response?.status === 401) {
          return 'Não autorizado. Faça login novamente.'
        }
        if (error?.response?.status === 403) {
          return 'Acesso negado. Você não tem permissão para acessar este recurso.'
        }
        if (error?.request && !error?.response) {
          return 'Erro de conexão. Verifique sua conexão com a internet e se o servidor está rodando na porta 3005.'
        }
        
        return error?.message || 'Erro desconhecido ao conectar com o servidor.'
      },
      async loadMovements () {
        this.loading = true
        try {
          this.movements = await MovementService.getAllEnriched()
        } catch (error: any) {
          console.error('Erro ao carregar movimentações:', error)
          const message = this.getErrorMessage(error)
          this.showError(`Erro ao carregar movimentações: ${message}`)
        } finally {
          this.loading = false
        }
      },
      async loadProducts () {
        try {
          this.products = await ProductService.getAll()
        } catch (error: any) {
          console.error('Erro ao carregar produtos:', error)
          const message = this.getErrorMessage(error)
          this.showError(`Erro ao carregar produtos: ${message}`)
        }
      },
      async loadLotes () {
        try {
          this.lotes = await LoteService.getAll()
        } catch (error: any) {
          console.error('Erro ao carregar lotes:', error)
          const message = this.getErrorMessage(error)
          this.showError(`Erro ao carregar lotes: ${message}`)
        }
      },
      async loadLocations () {
        try {
          this.locations = await LocationService.getAllComplete(this.authStore.ufId)
        } catch (error: any) {
          console.error('Erro ao carregar localizações:', error)
          const message = this.getErrorMessage(error)
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

          this.showSuccess(
            `${this.dialogType === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
          )

          this.createDialog = false
          this.resetForm()
          await this.loadMovements()
        } catch (error) {
          console.error('Erro ao salvar movimentação:', error)
          this.showError('Erro ao salvar movimentação')
        } finally {
          this.saving = false
        }
      },
      viewMovement (movement: StockMovementEnriched) {
        this.selectedMovement = movement
        this.viewDialog = true
      },
    },
  }
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
