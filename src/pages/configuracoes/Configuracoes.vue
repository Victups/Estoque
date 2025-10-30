<template>
  <div class="configuracoes-page">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-3" color="primary">mdi-cog</v-icon>
              <span class="text-h5">Configurações do Sistema</span>
            </v-card-title>

            <v-card-text>
              <v-tabs
                v-model="tab"
                align-tabs="start"
                class="mb-4"
                color="primary"
              >
                <v-tab value="categorias">
                  <v-icon class="mr-2">mdi-tag-multiple</v-icon>
                  Categorias
                </v-tab>
                <v-tab value="marcas">
                  <v-icon class="mr-2">mdi-tag</v-icon>
                  Marcas
                </v-tab>
                <v-tab value="unidades">
                  <v-icon class="mr-2">mdi-scale-balance</v-icon>
                  Unidades de Medida
                </v-tab>
                <v-tab value="fornecedores">
                  <v-icon class="mr-2">mdi-truck-delivery</v-icon>
                  Fornecedores
                </v-tab>
                <v-tab value="localizacoes">
                  <v-icon class="mr-2">mdi-map-marker</v-icon>
                  Localizações
                </v-tab>
                <v-tab value="depositos">
                  <v-icon class="mr-2">mdi-warehouse</v-icon>
                  Depósitos
                </v-tab>
              </v-tabs>

              <v-window v-model="tab">
                <!-- Categorias -->
                <v-window-item value="categorias">
                  <Categorias />
                </v-window-item>

                <!-- Marcas -->
                <v-window-item value="marcas">
                  <Marcas />
                </v-window-item>

                <!-- Unidades de Medida -->
                <v-window-item value="unidades">
                  <UnidadesMedida />
                </v-window-item>

                <!-- Fornecedores -->
                <v-window-item value="fornecedores">
                  <Fornecedores />
                </v-window-item>

                <!-- Localizações -->
                <v-window-item value="localizacoes">
                  <Localizacoes />
                </v-window-item>

                <!-- Depósitos -->
                <v-window-item value="depositos">
                  <Depositos />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import Categorias from '@/components/categorias/Categorias.vue'
  import Depositos from '@/components/locais/Depositos.vue'
  import Fornecedores from '@/components/fornecedores/Fornecedores.vue'
  import Localizacoes from '@/components/locais/Localizacoes.vue'
  import Marcas from '@/components/produtos/Marcas.vue'
  import UnidadesMedida from '@/components/produtos/UnidadesMedida.vue'

  export default {
    name: 'ConfiguracoesPage',
    components: {
      Categorias,
      Depositos,
      Fornecedores,
      Localizacoes,
      Marcas,
      UnidadesMedida,
    },
    data () {
      return {
        tab: 'categorias',
      }
    },
  }
</script>

<style scoped>
.configuracoes-page {
  min-height: 100vh;
  background-color: #070707;
}
</style>