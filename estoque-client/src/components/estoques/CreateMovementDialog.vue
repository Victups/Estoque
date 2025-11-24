<template>
  <v-dialog :model-value="modelValue" max-width="900" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card elevation="8">
      <v-card-title class="pa-4" :class="dialogType === 'entrada' ? 'bg-success' : 'bg-error'">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :icon="dialogType === 'entrada' ? 'mdi-arrow-down-circle' : 'mdi-arrow-up-circle'"
            size="30"
          />
          <span class="text-h5">
            Nova {{ dialogType === 'entrada' ? 'Entrada' : 'Saída' }} de Estoque
          </span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="validForm">
          <v-row>
            <!-- Product Selection -->
            <v-col cols="12">
              <h3 class="text-h6 font-weight-bold mb-3">
                <v-icon class="mr-2">mdi-package-variant</v-icon>
                Produto
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="localFormData.id_produto"
                clearable
                density="comfortable"
                hide-details="auto"
                item-title="label"
                item-value="value"
                :items="productOptions"
                label="Selecione o Produto"
                prepend-inner-icon="mdi-package"
                :rules="[rules.required]"
                variant="outlined"
                @update:model-value="onProductChange"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="localFormData.id_lote"
                clearable
                density="comfortable"
                :disabled="!localFormData.id_produto"
                hide-details="auto"
                item-title="label"
                item-value="value"
                :items="loteOptions"
                label="Lote"
                prepend-inner-icon="mdi-barcode"
                :rules="dialogType === 'saida' ? [rules.required] : []"
                variant="outlined"
                @update:model-value="onLoteChange"
              />
            </v-col>

            <!-- Movement Details -->
            <v-col cols="12">
              <v-divider class="my-4" />
              <h3 class="text-h6 font-weight-bold mb-3">
                <v-icon class="mr-2">mdi-information</v-icon>
                Detalhes da Movimentação
              </h3>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="quantidadeInput"
                density="comfortable"
                hide-details="auto"
                label="Quantidade"
                prepend-inner-icon="mdi-numeric"
                :rules="[rules.required, rules.positive]"
                variant="outlined"
                @update:model-value="onQuantidadeInput"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="precoUnitarioInput"
                density="comfortable"
                hide-details="auto"
                label="Preço Unitário (R$)"
                prepend-inner-icon="mdi-currency-usd"
                :rules="[rules.required]"
                variant="outlined"
                @update:model-value="onPrecoUnitarioInput"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                density="comfortable"
                hide-details="auto"
                label="Valor Total (R$)"
                :model-value="formatCurrency(valorTotal)"
                prepend-inner-icon="mdi-calculator"
                readonly
                variant="outlined"
              />
            </v-col>

            <!-- Location -->
            <v-col cols="12">
              <v-divider class="my-4" />
              <h3 class="text-h6 font-weight-bold mb-3">
                <v-icon class="mr-2">mdi-map-marker</v-icon>
                Localização
              </h3>
            </v-col>

            <v-col v-if="dialogType === 'saida'" cols="12" md="6">
              <v-select
                v-model="localFormData.id_localizacao_origem"
                clearable
                density="comfortable"
                hide-details="auto"
                item-title="label"
                item-value="value"
                :items="saidaLocationOptions"
                label="Origem"
                prepend-inner-icon="mdi-source-fork"
                :rules="dialogType === 'saida' ? [rules.required] : []"
                variant="outlined"
              />
            </v-col>

            <v-col v-if="dialogType === 'entrada'" cols="12" md="6">
              <v-select
                v-model="localFormData.id_localizacao_destino"
                clearable
                density="comfortable"
                hide-details="auto"
                item-title="label"
                item-value="value"
                :items="locationOptions"
                label="Destino"
                prepend-inner-icon="mdi-target"
                :rules="dialogType === 'entrada' ? [rules.required] : []"
                variant="outlined"
              />
            </v-col>

            <v-col
              v-if="dialogType === 'entrada' && usarNovoLote"
              cols="12"
            >
              <v-alert
                border="start"
                class="mb-4"
                color="info"
                density="comfortable"
                icon="mdi-information"
                variant="tonal"
              >
                Nenhum lote disponível para este produto. Um novo lote será criado utilizando os dados abaixo.
              </v-alert>
            </v-col>

            <v-col
              v-if="dialogType === 'entrada' && usarNovoLote"
              cols="12"
              md="12"
            >
              <v-text-field
                v-model="novoLote.data_validade"
                label="Data de Validade (opcional)"
                prepend-inner-icon="mdi-calendar"
                type="date"
                variant="outlined"
              />
            </v-col>

            <!-- Observations -->
            <v-col cols="12">
              <v-textarea
                v-model="localFormData.observacao"
                density="comfortable"
                hide-details="auto"
                label="Observações"
                prepend-inner-icon="mdi-note-text"
                rows="3"
                variant="outlined"
              />
            </v-col>

            <!-- Informações do Produto Selecionado -->
            <v-col v-if="selectedProduct" cols="12">
              <v-divider class="my-4" />
              <v-card class="info-card" color="info" variant="tonal">
                <v-card-text>
                  <h4 class="font-weight-bold mb-3 d-flex align-center">
                    <v-icon class="mr-2" icon="mdi-information" />
                    Informações do Produto
                  </h4>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Código</div>
                      <div class="font-weight-bold">{{ selectedProduct.codigo }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Nome</div>
                      <div class="font-weight-bold">{{ selectedProduct.nome }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Estoque Mínimo</div>
                      <div class="font-weight-bold">{{ selectedProduct.estoque_minimo }}</div>
                    </v-col>
                    <v-col v-if="selectedProduct && 'estoque_maximo' in selectedProduct" cols="6" md="3">
                      <div class="text-caption">Estoque Máximo</div>
                      <div class="font-weight-bold">{{ selectedProduct.estoque_maximo }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Informações do Lote Selecionado -->
            <v-col v-if="selectedLote" cols="12">
              <v-card class="info-card" color="success" variant="tonal">
                <v-card-text>
                  <h4 class="font-weight-bold mb-3 d-flex align-center">
                    <v-icon class="mr-2" icon="mdi-package-variant" />
                    Informações do Lote
                  </h4>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Código Lote</div>
                      <div class="font-weight-bold">{{ selectedLote.codigo_lote }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Quantidade Disponível</div>
                      <div class="font-weight-bold text-success">{{ selectedLote.quantidade }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Validade</div>
                      <div class="font-weight-bold">{{ formatDate(selectedLote.data_validade) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption">Custo Unitário</div>
                      <div class="font-weight-bold">{{ formatCurrency(selectedLote.custo_unitario ?? 0) }}</div>
                    </v-col>
                    <v-col v-if="selectedLote.id_localizacao" cols="12">
                      <div class="text-caption">Localização Atual</div>
                      <div class="font-weight-bold d-flex align-center">
                        <v-icon class="mr-2" color="success" icon="mdi-map-marker" size="small" />
                        {{ getLocalizacaoNome(selectedLote.id_localizacao) }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Summary Card -->
            <v-col cols="12">
              <v-divider class="my-4" />
              <v-card color="grey-lighten-4" variant="outlined">
                <v-card-text>
                  <h4 class="font-weight-bold mb-3">Resumo da Movimentação</h4>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-grey">Tipo</div>
                      <div class="font-weight-bold">
                        {{ dialogType === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-grey">Quantidade</div>
                      <div class="font-weight-bold">{{ localFormData.quantidade || 0 }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-grey">Preço Unit.</div>
                      <div class="font-weight-bold">{{ formatCurrency(localFormData.preco_unitario) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-grey">Total</div>
                      <div class="font-weight-bold text-primary">{{ formatCurrency(valorTotal) }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('cancel')"
        >
          <v-icon class="mr-1" icon="mdi-close" />
          Cancelar
        </v-btn>
        <v-btn
          :color="dialogType === 'entrada' ? 'success' : 'error'"
          :disabled="!validForm"
          :loading="saving"
          variant="elevated"
          @click="$emit('save', localFormData)"
        >
          <v-icon
            class="mr-1"
            :icon="dialogType === 'entrada' ? 'mdi-plus-circle' : 'mdi-minus-circle'"
          />
          Registrar {{ dialogType === 'entrada' ? 'Entrada' : 'Saída' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { MovementFormData, MovementType, Product, ProductLote } from '@/interfaces'
import type { LocationComplete } from '@/services'
import { estoqueRules } from '@/utils/rules'

type MovementFormDataExtended = Omit<MovementFormData, 'id_lote'> & { id_lote: number | 'novo' | null }

interface VForm {
  validate: () => Promise<{ valid: boolean }>
  reset: () => void
}

export default {
  name: 'CreateMovementDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    dialogType: {
      type: String as () => MovementType,
      required: true,
    },
    formData: {
      type: Object as () => MovementFormDataExtended,
      required: true,
    },
    products: {
      type: Array as () => Product[],
      required: true,
    },
    lotes: {
      type: Array as () => ProductLote[],
      required: true,
    },
    locations: {
      type: Array as () => LocationComplete[],
      required: true,
    },
    selectedProduct: {
      type: Object as () => Product | null,
      default: null,
    },
    selectedLote: {
      type: Object as () => ProductLote | null,
      default: null,
    },
    usarNovoLote: {
      type: Boolean,
      default: false,
    },
    novoLote: {
      type: Object as () => { data_validade: string },
      required: true,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'update:formData', 'update:novoLote', 'cancel', 'save', 'product-change', 'lote-change'],
  data () {
    return {
      validForm: false,
      quantidadeInput: '',
      precoUnitarioInput: '',
      formRef: null as VForm | null,
    }
  },
  computed: {
    localFormData: {
      get (): MovementFormDataExtended {
        return this.formData
      },
      set (value: MovementFormDataExtended) {
        this.$emit('update:formData', value)
      },
    },
    valorTotal (): number {
      return this.formData.quantidade * (this.formData.preco_unitario || 0)
    },
    productOptions () {
      return this.products.map((p: Product) => ({
        label: `${p.codigo} - ${p.nome}`,
        value: p.id,
      }))
    },
    loteOptions () {
      if (!this.formData.id_produto) return []

      const productLotes = this.lotes.filter(
        (l: ProductLote) => l.id_produto === this.formData.id_produto && l.quantidade > 0,
      )

      const toTimestamp = (value?: string | null) =>
        value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER

      const lotesOrdenados = [...productLotes].toSorted((a, b) =>
        toTimestamp(a.data_validade) - toTimestamp(b.data_validade),
      )

      const options: Array<{ label: string, value: number | 'novo' }> = lotesOrdenados.map((l: ProductLote) => ({
        label: `${l.codigo_lote} - Val: ${this.formatDate(l.data_validade)} - Qtd: ${l.quantidade}`,
        value: l.id,
      }))

      if (this.dialogType === 'entrada') {
        options.unshift({
          label: 'Criar novo lote',
          value: 'novo' as const,
        })
      }

      return options
    },
    locationOptions () {
      return this.locations.map((l: LocationComplete) => ({
        label: l.localizacao_completa || `${l.corredor} - ${l.prateleira} - ${l.secao}`,
        value: l.id,
      }))
    },
    saidaLocationOptions () {
      if (this.dialogType !== 'saida') {
        return this.locationOptions
      }
      if (!this.formData.id_produto) {
        return []
      }

      const relatedLotes = this.lotes.filter(
        (l: ProductLote) => l.id_produto === this.formData.id_produto && (l.quantidade ?? 0) > 0,
      )

      const options: Array<{ label: string, value: number }> = []
      const seen = new Set<number>()

      for (const lote of relatedLotes) {
        if (!lote.id_localizacao || seen.has(lote.id_localizacao)) {
          continue
        }
        seen.add(lote.id_localizacao)
        const location = this.locations.find((l: LocationComplete) => l.id === lote.id_localizacao)
        const label = location?.localizacao_completa
          || this.getLocalizacaoNome(lote.id_localizacao)
          || `Localização ${lote.id_localizacao}`
        options.push({
          value: lote.id_localizacao,
          label,
        })
      }

      return options.length > 0 ? options : this.locationOptions
    },
    rules () {
      return {
        required: estoqueRules.required,
        positive: estoqueRules.positive,
        numeric: estoqueRules.numeric,
      }
    },
  },
  methods: {
    formatBRLFromCents (cents: number): string {
      const value = (cents / 100).toFixed(2)
      const [ints = '0', decs = '00'] = value.split('.')
      const intsFormatted = ints.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return `${intsFormatted},${decs}`
    },
    toCents (value: string): number {
      const cleanValue = value.replace(/[^\d]/g, '')
      return Number.parseInt(cleanValue, 10) || 0
    },
    parseQuantity (value: string): number {
      const cleanValue = value.replace(/[^\d]/g, '')
      return Number.parseInt(cleanValue, 10) || 0
    },
    formatQuantity (value: string): string {
      const cleanValue = value.replace(/[^\d]/g, '')
      if (!cleanValue) return ''
      return Number.parseInt(cleanValue, 10).toLocaleString('pt-BR')
    },
    onQuantidadeInput (value: string) {
      const formatted = this.formatQuantity(value)
      this.quantidadeInput = formatted
      const updated = { ...this.localFormData, quantidade: this.parseQuantity(value) }
      this.$emit('update:formData', updated)
    },
    onPrecoUnitarioInput (value: string) {
      const formatted = this.formatBRLFromCents(this.toCents(value))
      this.precoUnitarioInput = formatted
      const updated = { ...this.localFormData, preco_unitario: this.toCents(value) / 100 }
      this.$emit('update:formData', updated)
    },
    onProductChange (productId: number) {
      this.$emit('product-change', productId)
    },
    onLoteChange (loteId: number | 'novo' | null) {
      this.$emit('lote-change', loteId)
    },
    formatCurrency (value?: number | null): string {
      const numeric = typeof value === 'number' ? value : 0
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numeric)
    },
    formatDate (dateString?: string | null): string {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    },
    getLocalizacaoNome (id: number): string {
      const location = this.locations.find((l: LocationComplete) => l.id === id)
      return location ? (location.localizacao_completa || `${location.corredor} - ${location.prateleira} - ${location.secao}`) : 'Não encontrada'
    },
    validate () {
      return this.formRef?.validate?.()
    },
  },
  expose: ['validate'],
}
</script>

<style scoped>
.info-card {
  border-radius: 8px;
}
</style>

