<template>
  <div class="cadastro-produtos-page">
    <v-container class="pa-6" fluid>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h3 font-weight-bold mb-2">
                <v-icon class="mr-3" icon="mdi-package-variant-plus" size="40" />
                Cadastro de Produtos
              </h1>
              <p class="text-h6 text-grey-darken-1">
                Cadastre novos produtos no estoque
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Form Card -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title class="bg-primary pa-4">
              <v-icon class="mr-2" icon="mdi-form-textbox" />
              <span class="text-h5">Informações do Produto</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <v-form ref="formRef" v-model="validForm">
                <v-row>
                  <!-- SEÇÃO 1: Dados Básicos do Produto -->
                  <v-col cols="12">
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                      Dados Básicos
                    </h3>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="productForm.nome"
                      density="comfortable"
                      hide-details="auto"
                      label="Nome do Produto *"
                      prepend-inner-icon="mdi-package-variant"
                      :rules="[validation.required]"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="productForm.codigo"
                      density="comfortable"
                      hide-details="auto"
                      hint="Deixe em branco para gerar automaticamente"
                      label="Código do Produto"
                      persistent-hint
                      prepend-inner-icon="mdi-barcode"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="productForm.descricao"
                      density="comfortable"
                      hide-details="auto"
                      label="Descrição"
                      prepend-inner-icon="mdi-text"
                      rows="3"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- SEÇÃO 2: Classificação -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="primary">mdi-tag-multiple</v-icon>
                      Classificação
                    </h3>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="productForm.id_categoria"
                      density="comfortable"
                      hide-details="auto"
                      item-title="nome"
                      item-value="id"
                      :items="categorias"
                      label="Categoria *"
                      prepend-inner-icon="mdi-shape"
                      :rules="[validation.required]"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="productForm.id_marca"
                      density="comfortable"
                      hide-details="auto"
                      item-title="nome"
                      item-value="id"
                      :items="marcas"
                      label="Marca *"
                      prepend-inner-icon="mdi-tag"
                      :rules="[validation.required]"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="productForm.id_unidade_medida"
                      density="comfortable"
                      hide-details="auto"
                      :items="unidadesMedida"
                      label="Unidade de Medida *"
                      prepend-inner-icon="mdi-scale"
                      :rules="[validation.required]"
                      variant="outlined"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #title>
                            {{ item.raw.descricao }} ({{ item.raw.abreviacao }})
                          </template>
                        </v-list-item>
                      </template>
                      <template #selection="{ item }">
                        {{ item.raw.descricao }} ({{ item.raw.abreviacao }})
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="productForm.estoque_minimo"
                      density="comfortable"
                      hide-details="auto"
                      label="Estoque Mínimo *"
                      min="0"
                      prepend-inner-icon="mdi-alert-circle"
                      :rules="[validation.required]"
                      step="0.01"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- SEÇÃO 3: Fornecedor (Opcional) -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="primary">mdi-truck</v-icon>
                      Fornecedor (Opcional)
                    </h3>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="productForm.id_fornecedor"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      item-title="nome"
                      item-value="id"
                      :items="fornecedores"
                      label="Fornecedor"
                      prepend-inner-icon="mdi-domain"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- SEÇÃO 4: Lote Inicial -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="success">mdi-package-down</v-icon>
                      Lote Inicial (Entrada no Estoque)
                    </h3>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="loteForm.quantidade"
                      density="comfortable"
                      hide-details="auto"
                      label="Quantidade Inicial *"
                      min="0"
                      prepend-inner-icon="mdi-numeric"
                      :rules="[validation.required, validation.positive]"
                      step="0.01"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="loteForm.custo_unitario"
                      density="comfortable"
                      hide-details="auto"
                      label="Custo Unitário (R$) *"
                      min="0"
                      prepend-inner-icon="mdi-currency-usd"
                      :rules="[validation.required]"
                      step="0.01"
                      type="number"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="loteForm.data_validade"
                      density="comfortable"
                      hide-details="auto"
                      label="Data de Validade *"
                      prepend-inner-icon="mdi-calendar"
                      :rules="[validation.required]"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- SEÇÃO 5: Localização no Estoque -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="warning">mdi-map-marker</v-icon>
                      Localização no Estoque
                    </h3>
                    <v-alert color="info" density="compact" variant="tonal">
                      <v-icon class="mr-2" size="small">mdi-information</v-icon>
                      Defina onde o produto será armazenado fisicamente
                    </v-alert>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="loteForm.id_localizacao"
                      density="comfortable"
                      hide-details="auto"
                      :items="localizacoesOptions"
                      label="Localização no Depósito *"
                      prepend-inner-icon="mdi-warehouse"
                      :rules="[validation.required]"
                      variant="outlined"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #prepend>
                            <v-icon color="primary">mdi-map-marker</v-icon>
                          </template>
                          <template #title>
                            {{ item.raw.label }}
                          </template>
                          <template #subtitle>
                            {{ item.raw.deposito }}
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <!-- Info da localização selecionada -->
                  <v-col v-if="localizacaoSelecionada" cols="12" md="6">
                    <v-card color="grey-lighten-4" variant="outlined">
                      <v-card-text>
                        <div class="text-caption text-grey mb-1">Localização Completa:</div>
                        <div class="font-weight-bold">{{ localizacaoSelecionada.localizacao_completa }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- SEÇÃO 6: Alérgenos (Opcional) -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h3 class="text-h6 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="error">mdi-alert</v-icon>
                      Informações de Alérgenos (Opcional)
                    </h3>
                  </v-col>

                  <v-col cols="12">
                    <v-combobox
                      v-model="productForm.alergenos"
                      chips
                      clearable
                      closable-chips
                      density="comfortable"
                      hide-details="auto"
                      hint="Ex: Contém Lactose, Contém Glúten, etc."
                      label="Alérgenos"
                      multiple
                      persistent-hint
                      prepend-inner-icon="mdi-alert-circle"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Resumo -->
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <v-card color="grey-lighten-4" variant="outlined">
                      <v-card-text>
                        <h4 class="font-weight-bold mb-3">
                          <v-icon class="mr-2">mdi-summary</v-icon>
                          Resumo do Cadastro
                        </h4>
                        <v-row dense>
                          <v-col cols="6" md="3">
                            <div class="text-caption text-grey">Produto</div>
                            <div class="font-weight-bold">{{ productForm.nome || '-' }}</div>
                          </v-col>
                          <v-col cols="6" md="3">
                            <div class="text-caption text-grey">Quantidade Inicial</div>
                            <div class="font-weight-bold">{{ loteForm.quantidade || 0 }}</div>
                          </v-col>
                          <v-col cols="6" md="3">
                            <div class="text-caption text-grey">Custo Unitário</div>
                            <div class="font-weight-bold">{{ formatCurrency(loteForm.custo_unitario) }}</div>
                          </v-col>
                          <v-col cols="6" md="3">
                            <div class="text-caption text-grey">Valor Total</div>
                            <div class="font-weight-bold text-primary">
                              {{ formatCurrency(loteForm.quantidade * loteForm.custo_unitario) }}
                            </div>
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
                prepend-icon="mdi-close"
                variant="text"
                @click="limparFormulario"
              >
                Limpar
              </v-btn>
              <v-btn
                color="success"
                :disabled="!validForm"
                :loading="saving"
                prepend-icon="mdi-content-save"
                size="large"
                variant="elevated"
                @click="cadastrarProduto"
              >
                Cadastrar Produto
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar
      :color="snackbarState.snackbarColor.value"
      :model-value="snackbarState.snackbar.value"
      :timeout="snackbarState.snackbarTimeout.value"
      elevation="8"
      location="top right"
      @update:model-value="snackbarState.snackbar.value = $event"
    >
      <div class="d-flex align-center">
        <v-icon
          class="mr-2"
          :icon="snackbarState.snackbarColor.value === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
        />
        {{ snackbarState.snackbarText.value }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  import type { Brand, Category, Product, ProductLote, Supplier, UnitMeasure } from '@/types'
  import type { LocationComplete } from '@/services'

  import { useFormValidation } from '@/composables/useFormValidation'
  import { useSnackbar } from '@/composables/useSnackbar'
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

  // Composables
  const snackbarState = useSnackbar()
  const validation = useFormValidation()
  const authStore = useAuthStore()

  // State
  const validForm = ref(false)
  const saving = ref(false)
  const formRef = ref<any>(null)

  // Data
  const categorias = ref<Category[]>([])
  const marcas = ref<Brand[]>([])
  const unidadesMedida = ref<UnitMeasure[]>([])
  const fornecedores = ref<Supplier[]>([])
  const localizacoes = ref<LocationComplete[]>([])

  // Form Data - Produto
  const productForm = ref({
    nome: '',
    codigo: '',
    descricao: '',
    id_unidade_medida: null as number | null,
    id_marca: null as number | null,
    id_categoria: null as number | null,
    estoque_minimo: 10,
    id_fornecedor: null as number | null,
    alergenos: [] as string[],
  })

  // Form Data - Lote Inicial
  const loteForm = ref({
    quantidade: 0,
    custo_unitario: 0,
    data_validade: '',
    id_localizacao: null as number | null,
  })

  // Computed
  const localizacoesOptions = computed(() => {
    return localizacoes.value.map(loc => ({
      title: `${loc.corredor} - ${loc.prateleira} - ${loc.secao}`,
      value: loc.id,
      label: `${loc.corredor} - ${loc.prateleira} - ${loc.secao}`,
      deposito: loc.deposito_nome || '',
      ...loc,
    }))
  })

  const localizacaoSelecionada = computed(() => {
    if (!loteForm.value.id_localizacao) return null
    return localizacoes.value.find(loc => loc.id === loteForm.value.id_localizacao)
  })

  // Methods
  async function loadData () {
    try {
      const ufId = authStore.ufId

      const [cats, brds, units, supps, locs] = await Promise.all([
        CategoryService.getAll(),
        BrandService.getAll(),
        UnitMeasureService.getAll(),
        SupplierService.getAll(),
        LocationService.getAllComplete(ufId),
      ])

      categorias.value = cats
      marcas.value = brds
      unidadesMedida.value = units
      fornecedores.value = supps
      localizacoes.value = locs

      console.log('✅ Dados carregados para cadastro')
      console.log(`📍 ${locs.length} localizações disponíveis na UF: ${authStore.ufLabel}`)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      snackbarState.showError('Erro ao carregar dados do formulário')
    }
  }

  async function cadastrarProduto () {
    if (!validForm.value) {
      snackbarState.showError('Preencha todos os campos obrigatórios')
      return
    }

    saving.value = true
    try {
      // 1. Criar o PRODUTO
      const productData: Omit<Product, 'id'> = {
        nome: productForm.value.nome,
        codigo: productForm.value.codigo || '',
        descricao: productForm.value.descricao,
        id_unidade_medida: productForm.value.id_unidade_medida!,
        id_marca: productForm.value.id_marca!,
        id_categoria: productForm.value.id_categoria!,
        responsavel_cadastro: 1, // TODO: pegar do authStore
        data_cadastro: new Date().toISOString(),
        usuario_log_id: null,
        estoque_minimo: productForm.value.estoque_minimo,
      }

      console.log('📤 BODY DO PRODUTO (será enviado):', JSON.stringify(productData, null, 2))
      
      const novoProduto = await ProductService.create(productData)
      console.log('✅ Produto criado:', novoProduto)

      // 2. Criar o LOTE INICIAL
      const loteData: Omit<ProductLote, 'id'> = {
        id_produto: novoProduto.id,
        codigo_lote: '', // Será gerado automaticamente
        data_validade: loteForm.value.data_validade,
        quantidade: loteForm.value.quantidade,
        data_entrada: new Date().toISOString().split('T')[0] || '',
        responsavel_cadastro: 1, // TODO: pegar do authStore
        custo_unitario: loteForm.value.custo_unitario,
        usuario_log_id: null,
        id_localizacao: loteForm.value.id_localizacao!,
      }

      console.log('📤 BODY DO LOTE (será enviado):', JSON.stringify(loteData, null, 2))
      
      const novoLote = await LoteService.create(loteData)
      console.log('✅ Lote inicial criado:', novoLote)

      // 3. Vincular FORNECEDOR (se selecionado)
      if (productForm.value.id_fornecedor) {
        // TODO: Implementar ProductSupplierService quando necessário
        console.log('ℹ️ Fornecedor será vinculado:', productForm.value.id_fornecedor)
      }

      // 4. Adicionar ALÉRGENOS (se houver)
      if (productForm.value.alergenos.length > 0) {
        // TODO: Implementar ProductAllergenService quando necessário
        console.log('ℹ️ Alérgenos serão cadastrados:', productForm.value.alergenos)
      }

      snackbarState.showSuccess(`Produto "${novoProduto.nome}" cadastrado com sucesso!`)
      limparFormulario()
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error)
      snackbarState.showError('Erro ao cadastrar produto')
    } finally {
      saving.value = false
    }
  }

  function limparFormulario () {
    productForm.value = {
      nome: '',
      codigo: '',
      descricao: '',
      id_unidade_medida: null,
      id_marca: null,
      id_categoria: null,
      estoque_minimo: 10,
      id_fornecedor: null,
      alergenos: [],
    }

    loteForm.value = {
      quantidade: 0,
      custo_unitario: 0,
      data_validade: '',
      id_localizacao: null,
    }

    formRef.value?.reset()
  }

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
.cadastro-produtos-page {
  min-height: 100vh;
  background: #000000;
  padding: 2rem 0;
}
</style>

