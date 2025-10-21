<template>
  <div class="movimentacao-page">
    <v-container class="pa-6" fluid>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h3 font-weight-bold mb-2">
                <v-icon class="mr-3" icon="mdi-swap-horizontal" size="40" />
                Movimentação de Estoque
              </h1>
              <p class="text-h6 text-grey-darken-1">
                Registre entradas e saídas de produtos
              </p>
            </div>
            <div class="d-flex gap-3">
              <v-btn
                color="success"
                elevation="2"
                prepend-icon="mdi-plus-circle"
                size="large"
                @click="openDialog('entrada')"
              >
                Nova Entrada
              </v-btn>
              <v-btn
                color="error"
                elevation="2"
                prepend-icon="mdi-minus-circle"
                size="large"
                @click="openDialog('saida')"
              >
                Nova Saída
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="primary" size="56">
                  <v-icon icon="mdi-swap-horizontal" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Total Movimentações</p>
                  <h2 class="text-h4 font-weight-bold">{{ movements.length }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="success" size="56">
                  <v-icon icon="mdi-arrow-down-circle" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Entradas</p>
                  <h2 class="text-h4 font-weight-bold">{{ entradasCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="error" size="56">
                  <v-icon icon="mdi-arrow-up-circle" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Saídas</p>
                  <h2 class="text-h4 font-weight-bold">{{ saidasCount }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3" sm="6">
          <v-card class="stat-card" elevation="3">
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar class="mr-4" color="info" size="56">
                  <v-icon icon="mdi-calendar-today" size="30" />
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-1">Hoje</p>
                  <h2 class="text-h4 font-weight-bold">{{ hojeMov }}</h2>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters and Table -->
      <v-row>
        <v-col cols="12">
          <v-card class="main-card" elevation="3">
            <v-card-title class="bg-primary pa-4">
              <v-icon class="mr-2" icon="mdi-history" />
              <span class="text-h5">Histórico de Movimentações</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Filters -->
              <v-row class="mb-4">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="search"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Buscar"
                    placeholder="Produto, lote, observação..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filterType"
                    clearable
                    density="comfortable"
                    hide-details
                    :items="['Todos', 'Entrada', 'Saída']"
                    label="Tipo"
                    prepend-inner-icon="mdi-filter"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filterDate"
                    clearable
                    density="comfortable"
                    hide-details
                    label="Data"
                    prepend-inner-icon="mdi-calendar"
                    type="date"
                    variant="outlined"
                  />
                </v-col>
                <v-col class="d-flex align-center" cols="12" md="2">
                  <v-btn
                    block
                    color="grey-darken-1"
                    prepend-icon="mdi-refresh"
                    variant="outlined"
                    @click="loadMovements"
                  >
                    Atualizar
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Data Table -->
              <v-data-table
                class="elevation-1"
                :headers="headers"
                :items="filteredMovements"
                :items-per-page="15"
                :loading="loading"
                loading-text="Carregando movimentações..."
                :search="search"
              >
                <template #item.tipo_movimento="{ item }">
                  <v-chip
                    :color="item.tipo_movimento === 'entrada' ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    <v-icon
                      class="mr-1"
                      :icon="item.tipo_movimento === 'entrada' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                      size="small"
                    />
                    {{ item.tipo_movimento === 'entrada' ? 'Entrada' : 'Saída' }}
                  </v-chip>
                </template>

                <template #item.quantidade="{ item }">
                  <span class="font-weight-bold">
                    {{ formatNumber(item.quantidade) }}
                  </span>
                </template>

                <template #item.preco_unitario="{ item }">
                  {{ formatCurrency(item.preco_unitario) }}
                </template>

                <template #item.valor_total="{ item }">
                  <span class="font-weight-bold text-primary">
                    {{ formatCurrency(item.quantidade * item.preco_unitario) }}
                  </span>
                </template>

                <template #item.localizacao="{ item }">
                  <div v-if="item.tipo_movimento === 'entrada' && item.localizacao_destino_nome">
                    <v-chip color="success" size="small" variant="tonal">
                      <v-icon class="mr-1" icon="mdi-arrow-right" size="small" />
                      {{ item.localizacao_destino_nome }}
                    </v-chip>
                  </div>
                  <div v-else-if="item.tipo_movimento === 'saida' && item.localizacao_origem_nome">
                    <v-chip color="error" size="small" variant="tonal">
                      <v-icon class="mr-1" icon="mdi-arrow-left" size="small" />
                      {{ item.localizacao_origem_nome }}
                    </v-chip>
                  </div>
                  <span v-else class="text-grey">-</span>
                </template>

                <template #item.data_mov="{ item }">
                  {{ formatDate(item.data_mov) }}
                </template>

                <template #item.actions="{ item }">
                  <v-tooltip location="top" text="Ver detalhes">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="info"
                        icon="mdi-eye"
                        size="small"
                        variant="tonal"
                        @click="viewMovement(item)"
                      />
                    </template>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create Movement Dialog -->
    <v-dialog v-model="createDialog" max-width="900" persistent>
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
                  v-model="formData.id_produto"
                  clearable
                  density="comfortable"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="productOptions"
                  label="Selecione o Produto"
                  prepend-inner-icon="mdi-package"
                  :rules="[validation.required]"
                  variant="outlined"
                  @update:model-value="onProductChange"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.id_lote"
                  clearable
                  density="comfortable"
                  :disabled="!formData.id_produto"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="loteOptions"
                  label="Lote"
                  prepend-inner-icon="mdi-barcode"
                  :rules="[validation.required]"
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
                  v-model.number="formData.quantidade"
                  density="comfortable"
                  hide-details="auto"
                  label="Quantidade"
                  min="0.01"
                  prepend-inner-icon="mdi-numeric"
                  :rules="[validation.required, validation.positive]"
                  step="0.01"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="formData.preco_unitario"
                  density="comfortable"
                  hide-details="auto"
                  label="Preço Unitário (R$)"
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
                  v-model="formData.id_localizacao_origem"
                  clearable
                  density="comfortable"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="locationOptions"
                  label="Origem"
                  prepend-inner-icon="mdi-source-fork"
                  :rules="dialogType === 'saida' ? [validation.required] : []"
                  variant="outlined"
                />
              </v-col>

              <v-col v-if="dialogType === 'entrada'" cols="12" md="6">
                <v-select
                  v-model="formData.id_localizacao_destino"
                  clearable
                  density="comfortable"
                  hide-details="auto"
                  item-title="label"
                  item-value="value"
                  :items="locationOptions"
                  label="Destino"
                  prepend-inner-icon="mdi-target"
                  :rules="dialogType === 'entrada' ? [validation.required] : []"
                  variant="outlined"
                />
              </v-col>

              <!-- Observations -->
              <v-col cols="12">
                <v-textarea
                  v-model="formData.observacao"
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
                      <v-col v-if="(selectedProduct as any).estoque_maximo" cols="6" md="3">
                        <div class="text-caption">Estoque Máximo</div>
                        <div class="font-weight-bold">{{ (selectedProduct as any).estoque_maximo }}</div>
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
                        <div class="font-weight-bold">{{ formatCurrency(selectedLote.custo_unitario) }}</div>
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
                        <div class="font-weight-bold">{{ formData.quantidade || 0 }}</div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="text-caption text-grey">Preço Unit.</div>
                        <div class="font-weight-bold">{{ formatCurrency(formData.preco_unitario) }}</div>
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
            @click="cancelCreate"
          >
            <v-icon class="mr-1" icon="mdi-close" />
            Cancelar
          </v-btn>
          <v-btn
            :color="dialogType === 'entrada' ? 'success' : 'error'"
            :disabled="!validForm"
            :loading="saving"
            variant="elevated"
            @click="saveMovement"
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

    <!-- View Movement Dialog -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card v-if="selectedMovement" elevation="8">
        <v-card-title class="bg-primary pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2" icon="mdi-file-document" size="30" />
              <span class="text-h5">Detalhes da Movimentação</span>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
          </div>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="text-center mb-4">
                <v-chip
                  :color="selectedMovement.tipo_movimento === 'entrada' ? 'success' : 'error'"
                  size="large"
                  variant="flat"
                >
                  <v-icon
                    class="mr-2"
                    :icon="selectedMovement.tipo_movimento === 'entrada' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                  />
                  {{ selectedMovement.tipo_movimento === 'entrada' ? 'ENTRADA' : 'SAÍDA' }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-package" />
                </template>
                <v-list-item-title class="font-weight-bold">Produto</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedMovement.produto_nome || `ID: ${selectedMovement.id_produto}` }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-barcode" />
                </template>
                <v-list-item-title class="font-weight-bold">Lote</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedMovement.lote_codigo || `ID: ${selectedMovement.id_lote}` }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col v-if="selectedMovement.tipo_movimento === 'entrada' && selectedMovement.localizacao_destino_nome" cols="12">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="success" icon="mdi-map-marker" />
                </template>
                <v-list-item-title class="font-weight-bold">Localização Destino</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedMovement.localizacao_destino_nome }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col v-if="selectedMovement.tipo_movimento === 'saida' && selectedMovement.localizacao_origem_nome" cols="12">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="error" icon="mdi-map-marker" />
                </template>
                <v-list-item-title class="font-weight-bold">Localização Origem</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedMovement.localizacao_origem_nome }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-numeric" />
                </template>
                <v-list-item-title class="font-weight-bold">Quantidade</v-list-item-title>
                <v-list-item-subtitle>{{ formatNumber(selectedMovement.quantidade) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-currency-usd" />
                </template>
                <v-list-item-title class="font-weight-bold">Preço Unitário</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(selectedMovement.preco_unitario) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-calendar" />
                </template>
                <v-list-item-title class="font-weight-bold">Data</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(selectedMovement.data_mov) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="success" icon="mdi-calculator" />
                </template>
                <v-list-item-title class="font-weight-bold">Valor Total</v-list-item-title>
                <v-list-item-subtitle class="text-h6 text-success">
                  {{ formatCurrency(selectedMovement.quantidade * selectedMovement.preco_unitario) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col v-if="selectedMovement.observacao" cols="12">
              <v-divider class="mb-4" />
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon color="primary" icon="mdi-note-text" />
                </template>
                <v-list-item-title class="font-weight-bold">Observações</v-list-item-title>
                <v-list-item-subtitle>{{ selectedMovement.observacao }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbarState.snackbar.value"
      :color="snackbarState.snackbarColor.value"
      elevation="8"
      location="top right"
      :timeout="snackbarState.snackbarTimeout.value"
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
  import type { LocationComplete } from '@/services/location.service'
  import type { MovementType, Product, ProductLote, StockMovement } from '@/types'
  import { computed, onMounted, ref } from 'vue'
  import { useFormValidation } from '@/composables/useFormValidation'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { LocationService, LoteService, MovementService, ProductService } from '@/services'
  import { useAuthStore } from '@/stores/auth'

  // Interface para movimentações enriquecidas
  interface StockMovementEnriched extends StockMovement {
    produto_nome?: string
    lote_codigo?: string
    localizacao_origem_nome?: string
    localizacao_destino_nome?: string
  }

  // Composables
  const snackbarState = useSnackbar()
  const validation = useFormValidation()
  const authStore = useAuthStore()

  // State
  const loading = ref<boolean>(false)
  const saving = ref<boolean>(false)
  const createDialog = ref<boolean>(false)
  const viewDialog = ref<boolean>(false)
  const validForm = ref<boolean>(false)
  const dialogType = ref<MovementType>('entrada')
  const search = ref<string>('')
  const filterType = ref<string>('Todos')
  const filterDate = ref<string>('')

  const movements = ref<StockMovementEnriched[]>([])
  const products = ref<Product[]>([])
  const lotes = ref<ProductLote[]>([])
  const locations = ref<LocationComplete[]>([])
  const selectedMovement = ref<StockMovementEnriched | null>(null)
  const selectedProduct = ref<Product | null>(null)
  const selectedLote = ref<ProductLote | null>(null)

  interface MovementFormData {
    id_produto: number | null
    id_lote: number | null
    quantidade: number
    preco_unitario: number
    observacao: string
    id_localizacao_origem: number | null
    id_localizacao_destino: number | null
  }

  const formData = ref<MovementFormData>({
    id_produto: null,
    id_lote: null,
    quantidade: 0,
    preco_unitario: 0,
    observacao: '',
    id_localizacao_origem: null,
    id_localizacao_destino: null,
  })

  interface VForm {
    validate: () => Promise<{ valid: boolean }>
    reset: () => void
  }

  const formRef = ref<VForm | null>(null)

  // Computed
  const entradasCount = computed<number>(() => {
    return movements.value.filter((m: StockMovementEnriched) => m.tipo_movimento === 'entrada').length
  })

  const saidasCount = computed<number>(() => {
    return movements.value.filter((m: StockMovementEnriched) => m.tipo_movimento === 'saida').length
  })

  const hojeMov = computed<number>(() => {
    const hoje = new Date().toISOString().split('T')[0]
    if (!hoje) return 0
    return movements.value.filter((m: StockMovementEnriched) =>
      m.data_mov.startsWith(hoje),
    ).length
  })

  const filteredMovements = computed<StockMovementEnriched[]>(() => {
    return movements.value.filter((mov: StockMovementEnriched) => {
      const typeMatch = filterType.value === 'Todos'
        || (filterType.value === 'Entrada' && mov.tipo_movimento === 'entrada')
        || (filterType.value === 'Saída' && mov.tipo_movimento === 'saida')

      const dateMatch = !filterDate.value || mov.data_mov.startsWith(filterDate.value)

      return typeMatch && dateMatch
    })
  })

  const valorTotal = computed<number>(() => {
    return formData.value.quantidade * formData.value.preco_unitario
  })

  const productOptions = computed(() => {
    return products.value.map((p: Product) => ({
      label: `${p.codigo} - ${p.nome}`,
      value: p.id,
    }))
  })

  /**
   * Opções de lotes ordenadas por FIFO (First-In, First-Out)
   * Lotes com vencimento mais próximo aparecem primeiro
   */
  const loteOptions = computed(() => {
    if (!formData.value.id_produto) return []

    const productLotes = lotes.value.filter(
      (l: ProductLote) => l.id_produto === formData.value.id_produto && l.quantidade > 0,
    )

    // Ordenar por data de validade (FIFO - First In, First Out)
    // Lotes que vencem primeiro devem ser usados primeiro
    const lotesOrdenados = [...productLotes].sort((a, b) =>
      new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime(),
    )

    return lotesOrdenados.map((l: ProductLote) => ({
      label: `${l.codigo_lote} - Val: ${formatDate(l.data_validade)} - Qtd: ${l.quantidade}`,
      value: l.id,
    }))
  })

  /**
   * Opções de localização com hierarquia completa (filtradas por UF se disponível)
   */
  const locationOptions = computed(() => {
    return locations.value.map((l: LocationComplete) => ({
      label: l.localizacao_completa || `${l.corredor} - ${l.prateleira} - ${l.secao}`,
      value: l.id,
    }))
  })

  interface TableHeader {
    title: string
    key: string
    sortable?: boolean
    width?: string
  }

  const headers: TableHeader[] = [
    { title: 'ID', key: 'id', width: '80px' },
    { title: 'Tipo', key: 'tipo_movimento', width: '120px' },
    { title: 'Produto', key: 'produto_nome' },
    { title: 'Lote', key: 'lote_codigo' },
    { title: 'Quantidade', key: 'quantidade' },
    { title: 'Preço Unit.', key: 'preco_unitario' },
    { title: 'Valor Total', key: 'valor_total' },
    { title: 'Localização', key: 'localizacao' },
    { title: 'Data', key: 'data_mov' },
    { title: 'Ações', key: 'actions', sortable: false, width: '100px' },
  ]

  // Methods
  async function loadMovements (): Promise<void> {
    loading.value = true
    try {
      movements.value = await MovementService.getAllEnriched()
      console.log('✅ Movimentações enriquecidas carregadas:', movements.value.length)
    } catch (error: unknown) {
      console.error('Erro ao buscar movimentações:', error)
      snackbarState.showError('Erro ao carregar movimentações')
    } finally {
      loading.value = false
    }
  }

  async function loadProducts (): Promise<void> {
    try {
      products.value = await ProductService.getAll()
    } catch (error: unknown) {
      console.error('Erro ao buscar produtos:', error)
    }
  }

  async function loadLotes (): Promise<void> {
    try {
      lotes.value = await LoteService.getAll()
    } catch (error: unknown) {
      console.error('Erro ao buscar lotes:', error)
    }
  }

  /**
   * Carrega localizações com hierarquia completa e filtra por UF se disponível
   */
  async function loadLocations (): Promise<void> {
    try {
      const ufId = authStore.ufId || null
      locations.value = await LocationService.getAllComplete(ufId)
      console.log(`✅ Localizações carregadas: ${locations.value.length}${ufId ? ` (filtradas por UF ${ufId})` : ''}`)
    } catch (error: unknown) {
      console.error('Erro ao buscar localizações:', error)
    }
  }

  function openDialog (type: MovementType): void {
    dialogType.value = type
    formData.value = {
      id_produto: null,
      id_lote: null,
      quantidade: 0,
      preco_unitario: 0,
      observacao: '',
      id_localizacao_origem: null,
      id_localizacao_destino: null,
    }
    createDialog.value = true
  }

  function cancelCreate (): void {
    createDialog.value = false
    formData.value = {
      id_produto: null,
      id_lote: null,
      quantidade: 0,
      preco_unitario: 0,
      observacao: '',
      id_localizacao_origem: null,
      id_localizacao_destino: null,
    }
    selectedProduct.value = null
    selectedLote.value = null
  }

  function onProductChange (): void {
    // Reset lote when product changes
    formData.value.id_lote = null
    selectedLote.value = null

    // Buscar informações do produto selecionado
    if (formData.value.id_produto) {
      const product = products.value.find(p => p.id === formData.value.id_produto)
      if (product) {
        selectedProduct.value = product
        console.log('✅ Produto selecionado:', {
          id: product.id,
          nome: product.nome,
          codigo: product.codigo,
          categoria: product.id_categoria,
          marca: product.id_marca,
        })
      }
    } else {
      selectedProduct.value = null
    }
  }

  function onLoteChange (): void {
    // Buscar informações do lote selecionado
    if (formData.value.id_lote) {
      const lote = lotes.value.find(l => l.id === formData.value.id_lote)
      if (lote) {
        selectedLote.value = lote

        // Preencher preço unitário automaticamente
        if (lote.custo_unitario) {
          formData.value.preco_unitario = lote.custo_unitario
        }

        // Para saída, preencher a localização de origem automaticamente
        if (dialogType.value === 'saida' && lote.id_localizacao) {
          formData.value.id_localizacao_origem = lote.id_localizacao
        }

        console.log('✅ Lote selecionado:', {
          id: lote.id,
          codigo: lote.codigo_lote,
          quantidade: lote.quantidade,
          custo_unitario: lote.custo_unitario,
          localizacao_id: lote.id_localizacao,
          data_validade: lote.data_validade,
        })
      }
    } else {
      selectedLote.value = null
    }
  }

  async function saveMovement (): Promise<void> {
    if (!formData.value.id_produto || !formData.value.id_lote) return

    saving.value = true
    try {
      const movementData: Omit<StockMovement, 'id'> = {
        id_produto: formData.value.id_produto,
        id_lote: formData.value.id_lote,
        quantidade: formData.value.quantidade,
        preco_unitario: formData.value.preco_unitario,
        observacao: formData.value.observacao || null,
        id_usuario: 1, // TODO: Pegar do usuário logado
        usuario_log_id: null,
        tipo_movimento: dialogType.value,
        id_localizacao_origem: dialogType.value === 'saida' ? formData.value.id_localizacao_origem : null,
        id_localizacao_destino: dialogType.value === 'entrada' ? formData.value.id_localizacao_destino : null,
        data_mov: new Date().toISOString(),
      }

      const newMovement = await MovementService.create(movementData)
      movements.value.unshift(newMovement)

      snackbarState.showSuccess(
        `${dialogType.value === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
      )
      createDialog.value = false
      formData.value = {
        id_produto: null,
        id_lote: null,
        quantidade: 0,
        preco_unitario: 0,
        observacao: '',
        id_localizacao_origem: null,
        id_localizacao_destino: null,
      }
      selectedProduct.value = null
      selectedLote.value = null
    } catch (error: unknown) {
      console.error('Erro ao salvar movimentação:', error)
      snackbarState.showError('Erro ao registrar movimentação')
    } finally {
      saving.value = false
    }
  }

  function viewMovement (movement: StockMovementEnriched): void {
    selectedMovement.value = movement
    viewDialog.value = true
  }

  function formatDate (dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatCurrency (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  function formatNumber (value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  function getLocalizacaoNome (id: number): string {
    const location = locations.value.find(l => l.id === id)
    return location?.localizacao_completa || `ID: ${id}`
  }

  onMounted(async () => {
    await Promise.all([
      loadMovements(),
      loadProducts(),
      loadLotes(),
      loadLocations(),
    ])
  })
</script>

<style scoped>
.movimentacao-page {
  min-height: 100vh;
  background: #000000;
  padding: 2rem 0;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
}

.gap-3 {
  gap: 1rem;
}

:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table tbody tr) {
  transition: background-color 0.2s ease;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-card-title.bg-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

:deep(.v-card-title.bg-success) {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  color: white;
}

:deep(.v-card-title.bg-error) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.info-card {
  margin-top: 1rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.info-card .text-caption {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 4px;
}
</style>
