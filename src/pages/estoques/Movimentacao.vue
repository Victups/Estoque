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
                <template #[`item.tipo_movimento`]="{ item }">
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

                <template #[`item.quantidade`]="{ item }">
                  <span class="font-weight-bold">
                    {{ formatNumber(item.quantidade) }}
                  </span>
                </template>

                <template #[`item.preco_unitario`]="{ item }">
                  {{ formatCurrency(item.preco_unitario) }}
                </template>

                <template #[`item.valor_total`]="{ item }">
                  <span class="font-weight-bold text-primary">
                    {{ formatCurrency(item.quantidade * item.preco_unitario) }}
                  </span>
                </template>

                <template #[`item.localizacao`]="{ item }">
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

                <template #[`item.data_mov`]="{ item }">
                  {{ formatDate(item.data_mov) }}
                </template>

                <template #[`item.actions`]="{ item }">
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
                  :rules="[rules.required]"
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
                  v-model="formData.id_localizacao_origem"
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
                  v-model="formData.id_localizacao_destino"
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
                md="6"
              >
                <v-text-field
                  v-model="novoLote.codigo_lote"
                  label="Código do Lote (opcional)"
                  placeholder="Gerado automaticamente se vazio"
                  prepend-inner-icon="mdi-barcode"
                  variant="outlined"
                />
              </v-col>

              <v-col
                v-if="dialogType === 'entrada' && usarNovoLote"
                cols="12"
                md="6"
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
                  {{ formatCurrency(selectedMovement.valor_total ?? (selectedMovement.quantidade * (selectedMovement.preco_unitario ?? 0))) }}
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
  import { estoqueRules } from '@/utils/rules'
  import { snackbarMixin } from '@/utils/snackbar'

  // Interface para movimentações enriquecidas

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
        // State
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
        formRef: null as VForm | null,
        // Máscara de formatação para inputs
        quantidadeInput: '',
        precoUnitarioInput: '',
        usarNovoLote: false,
        novoLote: {
          codigo_lote: '',
          data_validade: '',
        },
        headers: [
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
        ],
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
      filteredMovements (): StockMovementEnriched[] {
        return this.movements.filter((mov: StockMovementEnriched) => {
          const typeMatch = this.filterType === 'Todos'
            || (this.filterType === 'Entrada' && mov.tipo_movimento === 'entrada')
            || (this.filterType === 'Saída' && mov.tipo_movimento === 'saida')

          const dateMatch = !this.filterDate || mov.data_mov.startsWith(this.filterDate)

          return typeMatch && dateMatch
        })
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
      /**
       * Opções de lotes ordenadas por FIFO (First-In, First-Out)
       * Lotes com vencimento mais próximo aparecem primeiro
       */
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
      /**
       * Opções de localização com hierarquia completa (filtradas por UF se disponível)
       */
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
      toCents (value: string): number {
        const cleanValue = value.replace(/[^\d]/g, '')
        return Number.parseInt(cleanValue, 10) || 0
      },
      toNumber (value: string): number {
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
        this.formData.quantidade = this.parseQuantity(value)
      },
      onPrecoUnitarioInput (value: string) {
        const formatted = this.formatBRLFromCents(this.toCents(value))
        this.precoUnitarioInput = formatted
        this.formData.preco_unitario = this.toCents(value) / 100
      },
      formatNumber (value: number): string {
        return value.toLocaleString('pt-BR')
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
      async loadMovements () {
        this.loading = true
        try {
          this.movements = await MovementService.getAllEnriched()
        } catch (error) {
          console.error('Erro ao carregar movimentações:', error)
          this.showError('Erro ao carregar movimentações')
        } finally {
          this.loading = false
        }
      },
      async loadProducts () {
        try {
          this.products = await ProductService.getAll()
        } catch (error) {
          console.error('Erro ao carregar produtos:', error)
        }
      },
      async loadLotes () {
        try {
          this.lotes = await LoteService.getAll()
        } catch (error) {
          console.error('Erro ao carregar lotes:', error)
        }
      },
      async loadLocations () {
        try {
          this.locations = await LocationService.getAllComplete(this.authStore.ufId)
        } catch (error) {
          console.error('Erro ao carregar localizações:', error)
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
        this.quantidadeInput = ''
        this.precoUnitarioInput = ''
        this.selectedProduct = null
        this.selectedLote = null
        this.usarNovoLote = false
        this.novoLote = {
          codigo_lote: '',
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

        // Sugerir preço baseado no lote selecionado
        if (this.selectedLote && this.dialogType === 'saida') {
          const custoUnitario = this.selectedLote.custo_unitario
          if (custoUnitario) {
            this.precoUnitarioInput = this.formatBRLFromCents(Math.round(custoUnitario * 100))
            this.formData.preco_unitario = custoUnitario
          }
        }

        if (this.selectedLote && this.dialogType === 'saida') {
          this.formData.id_localizacao_origem = this.selectedLote.id_localizacao ?? null
        }
      },
      async saveMovement () {
        if (!this.formData.id_produto) {
          this.showError('Selecione um produto para continuar')
          return
        }

        const validation = await this.formRef?.validate?.()
        if (validation && !validation.valid) {
          return
        }

        this.saving = true
        try {
          const storedUser = getStoredUser()
          const idUsuario = storedUser?.id ?? 1

          let loteId: number | null = typeof this.formData.id_lote === 'number'
            ? this.formData.id_lote
            : null

          if (this.dialogType === 'entrada' && (this.usarNovoLote || this.formData.id_lote === 'novo' || !loteId)) {
            if (!this.formData.id_localizacao_destino) {
              this.showError('Informe a localização de destino para criar o lote')
              this.saving = false
              return
            }
            if (this.formData.quantidade <= 0) {
              this.showError('Quantidade deve ser maior que zero')
              this.saving = false
              return
            }

            const payload: CreateLoteInput = {
              id_produto: this.formData.id_produto,
              codigo_lote: this.novoLote.codigo_lote || undefined,
              data_validade: this.novoLote.data_validade || undefined,
              quantidade: this.formData.quantidade,
              data_entrada: new Date().toISOString().slice(0, 10),
              responsavel_cadastro: idUsuario,
              usuario_log_id: idUsuario,
              id_localizacao: this.formData.id_localizacao_destino ?? undefined,
              custo_unitario: this.formData.preco_unitario || undefined,
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
            ? this.formData.id_localizacao_destino
            : this.formData.id_localizacao_origem

          await MovementService.create({
            id_produto: this.formData.id_produto,
            id_lote: loteId,
            id_usuario: idUsuario,
            quantidade: this.formData.quantidade,
            tipo_movimento: this.dialogType,
            preco_unitario: this.formData.preco_unitario || undefined,
            observacao: this.formData.observacao?.trim() || undefined,
            id_localizacao: idLocalizacao ?? null,
            id_localizacao_origem: this.formData.id_localizacao_origem ?? null,
            id_localizacao_destino: this.formData.id_localizacao_destino ?? null,
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

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.main-card {
  border-radius: 12px;
}

.info-card {
  border-radius: 8px;
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
