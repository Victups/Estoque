<template>
  <div class="cadastro-produtos-page">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="elevation-8">
            <v-card-title class="text-h4 text-center py-6 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary" size="large">
                  {{ isEditMode ? 'mdi-pencil' : 'mdi-package-variant-plus' }}
                </v-icon>
                {{ pageTitle }}
              </div>
              <v-btn
                color="white"
                icon="mdi-close"
                size="large"
                variant="text"
                @click="$router.push('/produtos')"
              />
            </v-card-title>

            <v-card-text>
              <v-progress-linear
                v-if="loadingProduto"
                class="mb-4"
                color="primary"
                indeterminate
              />
              <v-form
                v-if="!loadingProduto"
                ref="formRef"
                v-model="validForm"
                @submit.prevent="salvarProduto"
              >
                <v-row>
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
                    sm="6"
                  >
                    <v-text-field
                      label="Código do Produto"
                      :model-value="produtoCodigo"
                      prepend-inner-icon="mdi-identifier"
                      readonly
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Informações Básicas -->
                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-text-field
                      v-model="formData.nome"
                      label="Nome do Produto"
                      placeholder="Digite o nome do produto"
                      prepend-inner-icon="mdi-package-variant"
                      required
                      :rules="rules.nome"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-text-field
                      v-model="formData.descricao"
                      label="Descrição"
                      placeholder="Descreva o produto"
                      prepend-inner-icon="mdi-text"
                      required
                      :rules="rules.descricao"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Categoria e Marca -->
                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-autocomplete
                      v-model="formData.id_categoria"
                      :items="categoriaOptions"
                      label="Categoria"
                      placeholder="Selecione a categoria"
                      prepend-inner-icon="mdi-tag"
                      required
                      :rules="rules.id_categoria"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-autocomplete
                      v-model="formData.id_marca"
                      :items="marcaOptions"
                      label="Marca"
                      placeholder="Selecione a marca"
                      prepend-inner-icon="mdi-tag-multiple"
                      required
                      :rules="rules.id_marca"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Unidade de Medida e Estoque Mínimo -->
                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-autocomplete
                      v-model="formData.id_unidade_medida"
                      :items="unidadeMedidaOptions"
                      label="Unidade de Medida"
                      placeholder="Selecione a unidade"
                      prepend-inner-icon="mdi-scale"
                      required
                      :rules="rules.id_unidade_medida"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-text-field
                      v-model.number="formData.estoque_minimo"
                      label="Estoque Mínimo"
                      placeholder="0"
                      prepend-inner-icon="mdi-warehouse"
                      required
                      :rules="rules.estoque_minimo"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Produto Perecível -->
                  <v-col cols="12">
                    <v-checkbox
                      v-model="formData.is_perecivel"
                      color="primary"
                      label="Produto Perecível"
                    />
                  </v-col>

                  <v-col
                    v-if="formData.is_perecivel"
                    cols="12"
                    lg="6"
                    md="6"
                    sm="6"
                  >
                    <v-text-field
                      v-model="formData.data_validade"
                      label="Data de Validade"
                      placeholder="YYYY-MM-DD"
                      prepend-inner-icon="mdi-calendar"
                      required
                      :rules="rules.data_validade"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-alert
                      border="start"
                      color="info"
                      density="comfortable"
                      icon="mdi-information-outline"
                      variant="tonal"
                    >
                      Os campos a seguir são apenas para referência. O lote inicial será criado automaticamente quando você registrar a <strong>entrada</strong> na tela de movimentação.
                    </v-alert>
                  </v-col>

                  <!-- Preços -->
                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-text-field
                      v-model="custoUnitarioInput"
                      hint="Informativo – será utilizado ao registrar a entrada"
                      label="Custo Unitário"
                      persistent-hint
                      placeholder="R$ 0,00"
                      prepend-inner-icon="mdi-currency-usd"
                      :rules="rules.custo_unitario"
                      variant="outlined"
                      @update:model-value="onCustoUnitarioInput"
                    />
                  </v-col>

                  <!-- Quantidade e Localização -->
                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-text-field
                      v-model.number="formData.quantidade"
                      hint="Valor sugerido para a primeira entrada"
                      label="Quantidade"
                      persistent-hint
                      placeholder="0"
                      prepend-inner-icon="mdi-counter"
                      :rules="rules.quantidade"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" lg="6" md="6" sm="6">
                    <v-autocomplete
                      v-model="formData.id_localizacao"
                      hint="Escolha onde pretende armazenar na entrada"
                      :items="localizacaoOptions"
                      label="Localização"
                      persistent-hint
                      placeholder="Selecione a localização"
                      prepend-inner-icon="mdi-map-marker"
                      :rules="rules.id_localizacao"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Fornecedor -->
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="formData.id_fornecedor"
                      hint="Opcional – vincula o produto ao fornecedor"
                      :items="fornecedorOptions"
                      label="Fornecedor"
                      persistent-hint
                      placeholder="Selecione o fornecedor"
                      prepend-inner-icon="mdi-truck"
                      :rules="rules.id_fornecedor"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col v-if="isEditMode && fornecedoresInfo.length > 0" cols="12">
                    <div class="d-flex align-center flex-wrap gap-2">
                      <span class="text-caption text-grey-lighten-1">Fornecedores já vinculados:</span>
                      <v-chip
                        v-for="fornecedor in fornecedoresInfo"
                        :key="fornecedor.id_fornecedor"
                        class="mr-2 mb-2"
                        color="primary"
                        size="small"
                        variant="tonal"
                      >
                        {{ fornecedor.nome }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <v-switch
                      v-model="formData.ativo"
                      color="success"
                      inset
                      label="Produto ativo"
                    />
                  </v-col>
                </v-row>

                <!-- Botões -->
                <v-row class="mt-6">
                  <v-col class="text-center" cols="12">
                    <div class="d-flex flex-column flex-sm-row justify-center align-center gap-3">
                      <v-btn
                        class="flex-grow-1 flex-sm-grow-0"
                        color="primary"
                        :disabled="saving || validForm === false"
                        :loading="saving"
                        size="large"
                        type="submit"
                        variant="elevated"
                      >
                        <v-icon class="mr-2">
                          {{ isEditMode ? 'mdi-content-save-edit' : 'mdi-content-save' }}
                        </v-icon>
                        {{ submitLabel }}
                      </v-btn>

                      <v-btn
                        class="flex-grow-1 flex-sm-grow-0"
                        color="grey"
                        size="large"
                        variant="outlined"
                        @click="limparFormulario"
                      >
                        <v-icon class="mr-2">mdi-refresh</v-icon>
                        Limpar
                      </v-btn>

                      <v-btn
                        class="flex-grow-1 flex-sm-grow-0"
                        color="error"
                        size="large"
                        variant="outlined"
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
  import type { Brand, Category, ProductDetail, Supplier, UnitMeasure } from '@/interfaces'
  import type { LocationComplete } from '@/services'
  import {
    BrandService,
    CategoryService,
    LocationService,
    ProductService,
    SupplierService,
    UnitMeasureService,
  } from '@/services'
  import { getStoredUser } from '@/services/auth.storage'
  import { useAuthStore } from '@/stores/auth'
  import { productRules, sharedRules } from '@/utils/rules'
  import { snackbarMixin } from '@/utils/snackbar'

  export default {
    name: 'CadastroProdutosPage',
    mixins: [snackbarMixin],
    setup () {
      const authStore = useAuthStore()
      return { authStore }
    },
    data () {
      return {
        // State
        validForm: null as boolean | null,
        saving: false,
        formRef: null as any,
        loadingProduto: false,
        produtoId: null as number | null,
        produtoCodigo: '',
        responsavelCadastroId: null as number | null,
        detalheProduto: null as ProductDetail | null,

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
          quantidade: 0,
          id_localizacao: null as number | null,
          id_fornecedor: null as number | null,
          ativo: true,
        },
        custoUnitarioInput: '',
      }
    },
    computed: {
      isEditMode (): boolean {
        return this.produtoId !== null
      },
      pageTitle (): string {
        return this.isEditMode ? 'Editar Produto' : 'Cadastro de Produtos'
      },
      submitLabel (): string {
        if (this.saving) {
          return this.isEditMode ? 'Atualizando...' : 'Salvando...'
        }
        return this.isEditMode ? 'Atualizar Produto' : 'Salvar Produto'
      },
      fornecedoresInfo () {
        return this.detalheProduto?.fornecedores ?? []
      },
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
          custo_unitario: [
            (v: string | number) => {
              const cents = typeof v === 'number' ? v : this.toCents(String(v))
              return cents >= 0 || 'Custo unitário não pode ser negativo'
            },
          ],
          quantidade: [
            (v: number) => v >= 0 || 'Quantidade não pode ser negativa',
          ],
          id_localizacao: [
            () => true,
          ],
          id_fornecedor: [
            () => true,
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
    watch: {
      '$route.params.id': {
        immediate: false,
        handler (this: any, newVal: string | undefined) {
          const parsed = Number(newVal)
          if (newVal && !Number.isNaN(parsed)) {
            void this.carregarProduto(parsed)
          } else if (!newVal) {
            void this.limparFormulario()
          }
        },
      },
    },
    async mounted () {
      await this.loadData()

      const idParam = (this.$route?.params as Record<string, unknown> | undefined)?.id as string | undefined
      const parsedId = Number(idParam)

      if (idParam && !Number.isNaN(parsedId)) {
        await this.carregarProduto(parsedId)
      }
    },
    methods: {
      async carregarProduto (id: number) {
        this.loadingProduto = true
        try {
          const detalhe = await ProductService.getDetail(id)
          this.detalheProduto = detalhe
          this.produtoId = detalhe.id
          this.produtoCodigo = detalhe.codigo
          this.responsavelCadastroId = detalhe.responsavel_cadastro

          const loteReferencia = detalhe.lotes?.[0]
          const fornecedorId = detalhe.fornecedores?.[0]?.id_fornecedor ?? null

          this.formData = {
            nome: detalhe.nome,
            descricao: detalhe.descricao ?? '',
            id_categoria: detalhe.id_categoria ?? null,
            id_marca: detalhe.id_marca ?? null,
            id_unidade_medida: detalhe.id_unidade_medida,
            estoque_minimo: detalhe.estoque_minimo ?? 0,
            is_perecivel: detalhe.is_perecivel,
            data_validade: detalhe.is_perecivel ? (loteReferencia?.data_validade ?? null) : null,
            custo_unitario: 0,
            quantidade: loteReferencia?.quantidade ?? 0,
            id_localizacao: loteReferencia?.id_localizacao ?? null,
            id_fornecedor: fornecedorId,
            ativo: detalhe.ativo,
          }

          this.custoUnitarioInput = this.formatBRLFromCents(0)
        } catch (error) {
          console.error('Erro ao carregar produto:', error)
          this.showError('Erro ao carregar dados do produto')
          this.$router.push('/produtos')
        } finally {
          this.loadingProduto = false
        }
      },

      formatBRLFromCents (cents: number): string {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(cents / 100)
      },

      toCents (value: string): number {
        const cleanValue = value.replace(/[^\d]/g, '')
        return Number.parseInt(cleanValue) || 0
      },

      toNumber (value: string): number {
        const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
        return Number.parseFloat(cleanValue) || 0
      },

      formatNumber (value: number): string {
        return new Intl.NumberFormat('pt-BR').format(value)
      },

      formatDate (value?: string | null): string {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return date.toLocaleString('pt-BR')
      },

      onCustoUnitarioInput (value: string) {
        const cents = this.toCents(value)
        this.custoUnitarioInput = this.formatBRLFromCents(cents)
        this.formData.custo_unitario = cents
      },

      async limparFormulario () {
        if (this.isEditMode && this.produtoId) {
          await this.carregarProduto(this.produtoId)
          return
        }

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
          quantidade: 0,
          id_localizacao: null,
          id_fornecedor: null,
          ativo: true,
        }
        this.custoUnitarioInput = ''
        this.produtoId = null
        this.produtoCodigo = ''
        this.responsavelCadastroId = null
        this.detalheProduto = null
        if (this.formRef) {
          this.formRef.reset()
        }
      },

      async salvarProduto () {
        this.saving = true
        try {
          const validation = await this.formRef?.validate?.()
          if (validation && !validation.valid) {
            this.saving = false
            return
          }

          const storedUser = getStoredUser()
          const usuarioLogId = storedUser?.id ?? 1

          if (this.isEditMode && this.produtoId) {
            const payload = {
              nome: this.formData.nome,
              descricao: this.formData.descricao,
              id_categoria: this.formData.id_categoria ?? undefined,
              id_marca: this.formData.id_marca ?? undefined,
              id_unidade_medida: this.formData.id_unidade_medida!,
              estoque_minimo: this.formData.estoque_minimo,
              is_perecivel: this.formData.is_perecivel,
              responsavel_cadastro: this.responsavelCadastroId ?? usuarioLogId,
              usuario_log_id: usuarioLogId,
              ativo: this.formData.ativo,
            }

            await ProductService.update(this.produtoId, payload)

            if (this.formData.id_fornecedor) {
              try {
                await ProductService.linkToSupplier(this.produtoId, this.formData.id_fornecedor, usuarioLogId)
              } catch (error) {
                console.error('Erro ao vincular produto ao fornecedor:', error)
                this.showWarning('Produto atualizado, mas houve erro ao vincular fornecedor')
              }
            }

            this.showSuccess('Produto atualizado com sucesso!')
            this.$router.push('/produtos')
            return
          }

          const produtoData = {
            nome: this.formData.nome,
            descricao: this.formData.descricao,
            codigo: '',
            id_categoria: this.formData.id_categoria!,
            id_marca: this.formData.id_marca!,
            id_unidade_medida: this.formData.id_unidade_medida!,
            estoque_minimo: this.formData.estoque_minimo,
            is_perecivel: this.formData.is_perecivel,
            responsavel_cadastro: usuarioLogId,
            usuario_log_id: usuarioLogId,
            ativo: this.formData.ativo,
          }

          const produto = await ProductService.create(produtoData)

          if (this.formData.id_fornecedor) {
            try {
              await ProductService.linkToSupplier(produto.id, this.formData.id_fornecedor, usuarioLogId)
            } catch (error) {
              console.error('Erro ao vincular produto ao fornecedor:', error)
              this.showWarning('Produto criado, mas houve erro ao vincular fornecedor')
            }
          }

          this.showSuccess('Produto cadastrado com sucesso! Agora registre a entrada nas movimentações para gerar o lote.')
          await this.limparFormulario()
        } catch (error) {
          console.error('Erro ao salvar produto:', error)
          this.showError(this.isEditMode ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto')
        } finally {
          this.saving = false
        }
      },

      async loadData () {
        try {
          const [
            categoriasData,
            marcasData,
            unidadesData,
            fornecedoresData,
            localizacoesData,
          ] = await Promise.all([
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
