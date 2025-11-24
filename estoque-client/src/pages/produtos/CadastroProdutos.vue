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
                <ProductFormFields
                  :form-data="formData"
                  :is-edit-mode="isEditMode"
                  :produto-codigo="produtoCodigo"
                  :detalhe-produto="detalheProduto"
                  :categorias="categorias"
                  :marcas="marcas"
                  :unidades-medida="unidadesMedida"
                  :fornecedores="fornecedores"
                  :selected-fornecedores="selectedFornecedores"
                  :fornecedores-vinculados="fornecedoresVinculados"
                  :fornecedores-info="fornecedoresInfo"
                  @update:form-data="formData = $event"
                  @update:selected-fornecedores="onFornecedoresChange($event)"
                  @remove-fornecedor="removerFornecedor"
                />

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
// @ts-nocheck
import type { Brand, Category, ProductDetail, Supplier, UnitMeasure } from '@/interfaces'
import {
  BrandService,
  CategoryService,
  ProductService,
  SupplierService,
  UnitMeasureService,
} from '@/services'
import { getStoredUser } from '@/services/auth.storage'
import { useAuthStore } from '@/stores/auth'
import ProductFormFields from '@/components/produtos/ProductFormFields.vue'
import type { SnackbarColor } from '@/utils/snackbar'
import type { FornecedorVinculado } from '@/interfaces'
import type { VForm } from '@/interfaces/ui/form'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'CadastroProdutosPage',
    components: {
      ProductFormFields,
    },
    setup () {
      const authStore = useAuthStore()
      return { authStore }
    },
    data () {
      return {
        validForm: false,
        saving: false,
        formRef: null as VForm | null,
        loadingProduto: false,
        produtoId: null as number | null,
        produtoCodigo: '',
        responsavelCadastroId: null as number | null,
        detalheProduto: null as ProductDetail | null,

        
        categorias: [] as Category[],
        marcas: [] as Brand[],
        unidadesMedida: [] as UnitMeasure[],
        fornecedores: [] as Supplier[],

        
        formData: {
          nome: '',
          descricao: '',
          id_categoria: null as number | null,
          id_marca: null as number | null,
          id_unidade_medida: null as number | null,
          estoque_minimo: 0,
          is_perecivel: false,
          data_validade: null as string | null,
          ativo: true,
        },
        selectedFornecedores: [] as number[],
        fornecedoresVinculados: [] as FornecedorVinculado[],

        // Snackbar
        snackbar: false,
        snackbarText: '',
        snackbarColor: 'success' as SnackbarColor,
        snackbarTimeout: 4000,
      }
    },
    computed: {
      isEditMode () {
        return this.produtoId !== null
      },
      pageTitle () {
        return this.isEditMode ? 'Editar Produto' : 'Cadastro de Produtos'
      },
      submitLabel () {
        if (this.saving) {
          return this.isEditMode ? 'Atualizando...' : 'Salvando...'
        }
        return this.isEditMode ? 'Atualizar Produto' : 'Salvar Produto'
      },
      fornecedoresInfo () {
        return this.detalheProduto?.fornecedores ?? []
      },
    },
    watch: {
      '$route.params.id': {
        immediate: false,
        handler (newVal: string | undefined) {
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

          this.formData = {
            nome: detalhe.nome,
            descricao: detalhe.descricao ?? '',
            id_categoria: detalhe.id_categoria ?? null,
            id_marca: detalhe.id_marca ?? null,
            id_unidade_medida: detalhe.id_unidade_medida,
            estoque_minimo: detalhe.estoque_minimo ?? 0,
            is_perecivel: detalhe.is_perecivel,
            data_validade: null,
            ativo: detalhe.ativo,
          }

          // Carregar fornecedores vinculados
          this.fornecedoresVinculados = detalhe.fornecedores?.map(f => ({
            id_fornecedor: f.id_fornecedor,
            nome: f.nome,
          })) ?? []
          this.selectedFornecedores = []
        } catch (error) {
          console.error('Erro ao carregar produto:', error)
          this.showError('Erro ao carregar dados do produto')
          this.$router.push('/produtos')
        } finally {
          this.loadingProduto = false
        }
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
          ativo: true,
        }
        this.selectedFornecedores = []
        this.fornecedoresVinculados = []
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
          const validation = await this.formRef?.validate()
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

            // Gerenciar fornecedores
            if (this.produtoId) {
              await this.gerenciarFornecedores(this.produtoId, usuarioLogId)
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

          // Gerenciar fornecedores para o novo produto
          if (produto.id) {
            await this.gerenciarFornecedores(produto.id, usuarioLogId)
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

      onFornecedoresChange (selectedIds: number[]) {
        // Adiciona novos fornecedores selecionados à lista de vinculados
        selectedIds.forEach((id: number) => {
          const jaVinculado = this.fornecedoresVinculados.some((f: FornecedorVinculado) => f.id_fornecedor === id)
          if (!jaVinculado) {
            const fornecedor = this.fornecedores.find((f: Supplier) => f.id === id)
            if (fornecedor) {
              this.fornecedoresVinculados.push({
                id_fornecedor: fornecedor.id,
                nome: fornecedor.nome,
              })
            }
          }
        })

        // Limpa a seleção após adicionar (apenas os novos selecionados)
        // Mantém os IDs que já estavam vinculados originalmente
        const idsOriginais = this.isEditMode ? new Set(this.fornecedoresInfo.map((f: FornecedorVinculado) => f.id_fornecedor)) : new Set()
        this.selectedFornecedores = selectedIds.filter((id: number) => idsOriginais.has(id))
      },

      removerFornecedor (fornecedorId: number) {
        // Remove da lista de vinculados
        this.fornecedoresVinculados = this.fornecedoresVinculados.filter((f: FornecedorVinculado) => f.id_fornecedor !== fornecedorId)
        // Remove da seleção se estiver lá
        this.selectedFornecedores = this.selectedFornecedores.filter((id: number) => id !== fornecedorId)
      },

      async gerenciarFornecedores (productId: number, usuarioLogId: number) {
        if (!this.isEditMode) {
          // Para novo produto, apenas adiciona os fornecedores selecionados
          for (const fornecedor of this.fornecedoresVinculados) {
            try {
              await ProductService.linkToSupplier(productId, fornecedor.id_fornecedor, usuarioLogId)
            } catch (error) {
              console.error(`Erro ao vincular fornecedor ${fornecedor.nome}:`, error)
            }
          }
          return
        }

        // Para edição, compara com os fornecedores originais
        const fornecedoresOriginais = new Set(this.fornecedoresInfo.map((f: FornecedorVinculado) => f.id_fornecedor))
        const fornecedoresAtuais = new Set(this.fornecedoresVinculados.map((f: FornecedorVinculado) => f.id_fornecedor))

        // Adiciona novos fornecedores
        const paraAdicionar = this.fornecedoresVinculados.filter((f: FornecedorVinculado) => !fornecedoresOriginais.has(f.id_fornecedor))
        for (const fornecedor of paraAdicionar) {
          try {
            await ProductService.linkToSupplier(productId, fornecedor.id_fornecedor, usuarioLogId)
          } catch (error) {
            console.error(`Erro ao vincular fornecedor ${fornecedor.nome}:`, error)
          }
        }

        // Remove fornecedores que foram desvinculados
        const paraRemover = this.fornecedoresInfo.filter((f: FornecedorVinculado) => !fornecedoresAtuais.has(f.id_fornecedor))
        for (const fornecedor of paraRemover) {
          try {
            await ProductService.unlinkFromSupplier(productId, fornecedor.id_fornecedor)
          } catch (error) {
            console.error(`Erro ao desvincular fornecedor ${fornecedor.nome}:`, error)
          }
        }
      },

      async loadData () {
        try {
          const [
            categoriasData,
            marcasData,
            unidadesData,
            fornecedoresData,
          ] = await Promise.all([
            CategoryService.getAll(),
            BrandService.getAll(),
            UnitMeasureService.getAll(),
            SupplierService.getAll(),
          ])

          this.categorias = categoriasData
          this.marcas = marcasData
          this.unidadesMedida = unidadesData
          this.fornecedores = fornecedoresData
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
          this.showError('Erro ao carregar dados')
        }
      },

      // Snackbar methods
      showSnackbar (options: { text: string, color?: SnackbarColor, timeout?: number } | string) {
        if (typeof options === 'string') {
          this.snackbarText = options
          this.snackbarColor = 'success'
          this.snackbarTimeout = 4000
        } else {
          this.snackbarText = options.text
          this.snackbarColor = options.color ?? 'success'
          this.snackbarTimeout = options.timeout ?? 4000
        }
        this.snackbar = true
      },

      showSuccess (text: string, timeout = 4000) {
        this.showSnackbar({ text, color: 'success', timeout })
      },

      showError (text: string, timeout = 4000) {
        this.showSnackbar({ text, color: 'error', timeout })
      },

      showWarning (text: string, timeout = 4000) {
        this.showSnackbar({ text, color: 'warning', timeout })
      },

      showInfo (text: string, timeout = 4000) {
        this.showSnackbar({ text, color: 'info', timeout })
      },
    },
  })
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
