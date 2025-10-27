<template>
  <div class="cadastro-produtos-page">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="elevation-8">
            <v-card-title class="text-h4 text-center py-6 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary" size="large">mdi-package-variant-plus</v-icon>
                Cadastro de Produtos
              </div>
              <v-btn
                  icon="mdi-close"
                  variant="text"
                  color="white"
                  size="large"
                  @click="$router.push('/produtos')"
              />
            </v-card-title>

            <v-card-text>
              <v-form ref="formRef" v-model="validForm" @submit.prevent="salvarProduto">
                <v-row>
                  <!-- Informações Básicas -->
                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model="formData.nome"
                        :rules="rules.nome"
                        label="Nome do Produto"
                        placeholder="Digite o nome do produto"
                        prepend-inner-icon="mdi-package-variant"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model="formData.descricao"
                        :rules="rules.descricao"
                        label="Descrição"
                        placeholder="Descreva o produto"
                        prepend-inner-icon="mdi-text"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <!-- Categoria e Marca -->
                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-autocomplete
                        v-model="formData.id_categoria"
                        :items="categoriaOptions"
                        :rules="rules.id_categoria"
                        label="Categoria"
                        placeholder="Selecione a categoria"
                        prepend-inner-icon="mdi-tag"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-autocomplete
                        v-model="formData.id_marca"
                        :items="marcaOptions"
                        :rules="rules.id_marca"
                        label="Marca"
                        placeholder="Selecione a marca"
                        prepend-inner-icon="mdi-tag-multiple"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <!-- Unidade de Medida e Estoque Mínimo -->
                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-autocomplete
                        v-model="formData.id_unidade_medida"
                        :items="unidadeMedidaOptions"
                        :rules="rules.id_unidade_medida"
                        label="Unidade de Medida"
                        placeholder="Selecione a unidade"
                        prepend-inner-icon="mdi-scale"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model.number="formData.estoque_minimo"
                        :rules="rules.estoque_minimo"
                        label="Estoque Mínimo"
                        placeholder="0"
                        prepend-inner-icon="mdi-warehouse"
                        type="number"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <!-- Produto Perecível -->
                  <v-col cols="12">
                    <v-checkbox
                        v-model="formData.is_perecivel"
                        label="Produto Perecível"
                        color="primary"
                    />
                  </v-col>

                  <v-col v-if="formData.is_perecivel" cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model="formData.data_validade"
                        :rules="rules.data_validade"
                        label="Data de Validade"
                        placeholder="YYYY-MM-DD"
                        prepend-inner-icon="mdi-calendar"
                        type="date"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <!-- Preços -->
                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model="custoUnitarioInput"
                        :rules="rules.custo_unitario"
                        label="Custo Unitário"
                        placeholder="R$ 0,00"
                        prepend-inner-icon="mdi-currency-usd"
                        variant="outlined"
                        @update:model-value="onCustoUnitarioInput"
                        required
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model="precoVendaInput"
                        :rules="rules.preco_venda"
                        label="Preço de Venda"
                        placeholder="R$ 0,00"
                        prepend-inner-icon="mdi-currency-usd"
                        variant="outlined"
                        @update:model-value="onPrecoVendaInput"
                        required
                    />
                  </v-col>

                  <!-- Quantidade e Localização -->
                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-text-field
                        v-model.number="formData.quantidade"
                        :rules="rules.quantidade"
                        label="Quantidade"
                        placeholder="0"
                        prepend-inner-icon="mdi-counter"
                        type="number"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6" lg="6">
                    <v-autocomplete
                        v-model="formData.id_localizacao"
                        :items="localizacaoOptions"
                        :rules="rules.id_localizacao"
                        label="Localização"
                        placeholder="Selecione a localização"
                        prepend-inner-icon="mdi-map-marker"
                        variant="outlined"
                        required
                    />
                  </v-col>

                  <!-- Fornecedor -->
                  <v-col cols="12">
                    <v-autocomplete
                        v-model="formData.id_fornecedor"
                        :items="fornecedorOptions"
                        :rules="rules.id_fornecedor"
                        label="Fornecedor"
                        placeholder="Selecione o fornecedor"
                        prepend-inner-icon="mdi-truck"
                        variant="outlined"
                        required
                    />
                  </v-col>
                </v-row>

                <!-- Botões -->
                <v-row class="mt-6">
                  <v-col cols="12" class="text-center">
                    <div class="d-flex flex-column flex-sm-row justify-center align-center gap-3">
                      <v-btn
                          color="primary"
                          :disabled="!validForm || saving"
                          :loading="saving"
                          size="large"
                          type="submit"
                          variant="elevated"
                          class="flex-grow-1 flex-sm-grow-0"
                      >
                        <v-icon class="mr-2">mdi-content-save</v-icon>
                        {{ saving ? 'Salvando...' : 'Salvar Produto' }}
                      </v-btn>

                      <v-btn
                          color="grey"
                          size="large"
                          variant="outlined"
                          class="flex-grow-1 flex-sm-grow-0"
                          @click="limparFormulario"
                      >
                        <v-icon class="mr-2">mdi-refresh</v-icon>
                        Limpar
                      </v-btn>

                      <v-btn
                          color="error"
                          size="large"
                          variant="outlined"
                          class="flex-grow-1 flex-sm-grow-0"
                          @click="$router.push('/produtos')"
                      >
                        <v-icon class="mr-2">mdi-close</v-icon>
                        Cancelar
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
import type { LocationComplete } from '@/services'

import type { Brand, Category, Product, ProductLote, Supplier, UnitMeasure } from '@/types'
import { snackbarMixin } from '@/utils/snackbar'
import { validationMixin } from '@/utils/validation'
import {
  BrandService,
  CategoryService,
  LocationService,
  LoteService,
  ProductService,
  SupplierService,
  UnitMeasureService,
} from '@/services'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'CadastroProdutosPage',
  mixins: [validationMixin, snackbarMixin],
  setup () {
    const authStore = useAuthStore()
    return { authStore }
  },
  data () {
    return {
      // State
      validForm: false,
      saving: false,
      formRef: null as any,

      // Data
      categorias: [] as Category[],
      marcas: [] as Brand[],
      unidadesMedida: [] as UnitMeasure[],
      fornecedores: [] as Supplier[],
      localizacoes: [] as LocationComplete[],

      // Form data
      formData: {
        nome: '',
        descricao: '',
        id_categoria: null as number | null,
        id_marca: null as number | null,
        id_unidade_medida: null as number | null,
        estoque_minimo: 0,
        is_perecivel: false,
        data_validade: null as string | null,
        custo_unitario: 0,
        preco_venda: 0,
        quantidade: 0,
        id_localizacao: null as number | null,
        id_fornecedor: null as number | null,
      },

      // Input masks
      custoUnitarioInput: '',
      precoVendaInput: '',
    }
  },
  computed: {
    rules () {
      return {
        nome: [
          (v: string) => !!v || 'Nome é obrigatório',
          (v: string) => v.length >= 3 || 'Nome deve ter pelo menos 3 caracteres',
        ],
        descricao: [
          (v: string) => !!v || 'Descrição é obrigatória',
          (v: string) => v.length >= 10 || 'Descrição deve ter pelo menos 10 caracteres',
        ],
        id_categoria: [(v: number) => !!v || 'Categoria é obrigatória'],
        id_marca: [(v: number) => !!v || 'Marca é obrigatória'],
        id_unidade_medida: [(v: number) => !!v || 'Unidade de medida é obrigatória'],
        estoque_minimo: [
          (v: number) => v >= 0 || 'Estoque mínimo deve ser maior ou igual a 0',
        ],
        data_validade: [
          (v: string) => {
            if (!this.formData.is_perecivel) return true
            return !!v || 'Data de validade é obrigatória para produtos perecíveis'
          },
        ],
        custo_unitario: [
          (v: number) => v > 0 || 'Custo unitário deve ser maior que 0',
        ],
        preco_venda: [
          (v: number) => v > 0 || 'Preço de venda deve ser maior que 0',
        ],
        quantidade: [
          (v: number) => v > 0 || 'Quantidade deve ser maior que 0',
        ],
        id_localizacao: [(v: number) => !!v || 'Localização é obrigatória'],
        id_fornecedor: [(v: number) => !!v || 'Fornecedor é obrigatório'],
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
    fornecedorOptions () {
      return this.fornecedores.map(fornecedor => ({
        title: fornecedor.nome,
        value: fornecedor.id,
      }))
    },
    localizacaoOptions () {
      return this.localizacoes.map(loc => ({
        title: `${loc.deposito_nome} - ${loc.corredor || ''} ${loc.prateleira || ''} ${loc.secao || ''}`.trim(),
        value: loc.id,
      }))
    },
  },
  methods: {
    formatBRLFromCents (cents: number): string {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(cents / 100)
    },

    toCents (value: string): number {
      const cleanValue = value.replace(/[^\d]/g, '')
      return parseInt(cleanValue) || 0
    },

    toNumber (value: string): number {
      const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
      return parseFloat(cleanValue) || 0
    },

    formatNumber (value: number): string {
      return new Intl.NumberFormat('pt-BR').format(value)
    },

    onCustoUnitarioInput (value: string) {
      const cents = this.toCents(value)
      this.custoUnitarioInput = this.formatBRLFromCents(cents)
      this.formData.custo_unitario = cents
    },

    onPrecoVendaInput (value: string) {
      const cents = this.toCents(value)
      this.precoVendaInput = this.formatBRLFromCents(cents)
      this.formData.preco_venda = cents
    },

    limparFormulario () {
      this.formData = {
        nome: '',
        descricao: '',
        id_categoria: null,
        id_marca: null,
        id_unidade_medida: null,
        estoque_minimo: 0,
        is_perecivel: false,
        data_validade: null,
        custo_unitario: 0,
        preco_venda: 0,
        quantidade: 0,
        id_localizacao: null,
        id_fornecedor: null,
      }
      this.custoUnitarioInput = ''
      this.precoVendaInput = ''
      if (this.formRef) {
        this.formRef.reset()
      }
    },

    async salvarProduto () {
      if (!this.validForm) return

      this.saving = true
      try {
        // Criar produto
        const produtoData = {
          nome: this.formData.nome,
          descricao: this.formData.descricao,
          codigo: '', // Será gerado automaticamente pelo banco
          id_categoria: this.formData.id_categoria!,
          id_marca: this.formData.id_marca!,
          id_unidade_medida: this.formData.id_unidade_medida!,
          estoque_minimo: this.formData.estoque_minimo,
          is_perecivel: this.formData.is_perecivel,
          responsavel_cadastro: this.authStore.userName ? 1 : 1,
          usuario_log_id: this.authStore.userName ? 1 : 1,
          data_cadastro: new Date().toISOString(),
        }

        const produto = await ProductService.create(produtoData)

        // Criar lote
        const dataValidade = (this.formData.data_validade || new Date().toISOString().split('T')[0]) as string
        const dataEntrada = new Date().toISOString().split('T')[0] as string
        const loteData = {
          id_produto: produto.id,
          codigo_lote: '', // Será gerado automaticamente pelo banco
          data_validade: dataValidade,
          quantidade: this.formData.quantidade,
          data_entrada: dataEntrada,
          custo_unitario: this.formData.custo_unitario,
          preco_venda: this.formData.preco_venda,
          responsavel_cadastro: this.authStore.userName ? 1 : 1,
          usuario_log_id: this.authStore.userName ? 1 : 1,
          id_localizacao: this.formData.id_localizacao!,
        }

        await LoteService.create(loteData)

        this.showSuccess('Produto cadastrado com sucesso!')
        this.limparFormulario()
      } catch (error) {
        console.error('Erro ao salvar produto:', error)
        this.showError('Erro ao cadastrar produto')
      } finally {
        this.saving = false
      }
    },

    async loadData () {
      try {
        const [categoriasData, marcasData, unidadesData, fornecedoresData, localizacoesData] = await Promise.all([
          CategoryService.getAll(),
          BrandService.getAll(),
          UnitMeasureService.getAll(),
          SupplierService.getAll(),
          LocationService.getAllComplete(),
        ])

        this.categorias = categoriasData
        this.marcas = marcasData
        this.unidadesMedida = unidadesData
        this.fornecedores = fornecedoresData
        this.localizacoes = localizacoesData
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        this.showError('Erro ao carregar dados')
      }
    },
  },
  mounted () {
    this.loadData()
  },
}
</script>

<style scoped>
.cadastro-produtos-page {
  background: #000000;
  min-height: 100vh;
  padding: 20px 0;
}

.v-card {
  background: #1a1a1a !important;
  border: 1px solid #333;
  max-width: 1200px;
  margin: 0 auto;
}

.v-card-title {
  color: #ffffff !important;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  border-radius: 8px 8px 0 0;
}

.v-text-field :deep(.v-field__input) {
  color: #ffffff !important;
}

.v-text-field :deep(.v-field__outline) {
  color: #666 !important;
}

.v-text-field :deep(.v-label) {
  color: #999 !important;
}

.v-autocomplete :deep(.v-field__input) {
  color: #ffffff !important;
}

.v-autocomplete :deep(.v-field__outline) {
  color: #666 !important;
}

.v-autocomplete :deep(.v-label) {
  color: #999 !important;
}

.v-checkbox :deep(.v-label) {
  color: #ffffff !important;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  min-width: 120px;
}

.v-snackbar :deep(.v-snackbar__content) {
  background: #1a1a1a !important;
  color: #ffffff !important;
}

/* Responsividade melhorada */
@media (max-width: 600px) {
  .cadastro-produtos-page {
    padding: 10px 0;
  }

  .v-card-title {
    font-size: 1.5rem !important;
    padding: 16px !important;
  }

  .v-card-title .d-flex {
    flex-direction: column;
    gap: 8px;
  }

  .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 960px) {
  .v-container {
    padding: 8px;
  }
}

/* Melhor espaçamento entre campos */
.v-row {
  margin-bottom: 8px;
}

.v-col {
  padding: 4px 8px;
}

/* Estilo para o botão de fechar no cabeçalho */
.v-card-title .v-btn {
  min-width: auto;
  margin-bottom: 0;
}

/* Gap para botões responsivos */
.gap-3 {
  gap: 12px;
}

@media (max-width: 600px) {
  .gap-3 {
    gap: 8px;
  }
}
</style>

<route lang="yaml">
meta:
layout: default
</route>