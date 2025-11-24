<template>
  <v-card class="main-card" elevation="3">
    <v-card-title class="bg-primary pa-4">
      <v-icon class="mr-2" icon="mdi-format-list-bulleted" />
      <span class="text-h5">Lista de Usuários</span>
    </v-card-title>

    <v-card-text class="pa-6">
      <!-- Filters -->
      <v-row class="mb-4">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="searchLocal"
            clearable
            density="comfortable"
            hide-details
            label="Buscar usuários"
            placeholder="Digite nome ou email..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @update:model-value="onSearchChange"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterRoleLocal"
            density="comfortable"
            hide-details
            :items="roleFilterOptions"
            label="Filtrar por Função"
            prepend-inner-icon="mdi-filter"
            variant="outlined"
            @update:model-value="onFiltersChange"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filterStatusLocal"
            density="comfortable"
            hide-details
            :items="statusFilterOptions"
            label="Filtrar por Status"
            prepend-inner-icon="mdi-filter-variant"
            variant="outlined"
            @update:model-value="onFiltersChange"
          />
        </v-col>
        <v-col class="d-flex align-center" cols="12" md="1">
          <v-btn
            color="grey-darken-1"
            icon="mdi-refresh"
            variant="outlined"
            @click="$emit('refresh')"
          />
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table
        class="elevation-1"
        :headers="headers"
        :items="filteredUsers"
        :items-per-page="10"
        :loading="loading"
        loading-text="Carregando usuários..."
      >
        <template #item.avatar="{ item }">
          <v-avatar :color="item.avatarColor" size="45">
            <span class="text-h6 text-white font-weight-bold">{{ item.initials }}</span>
          </v-avatar>
        </template>

        <template #item.name="{ item }">
          <div>
            <div class="font-weight-bold">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.email }}</div>
          </div>
        </template>

        <template #item.role="{ item }">
          <v-chip
            class="font-weight-bold"
            :color="getRoleColor(item.role)"
            size="small"
            variant="flat"
          >
            <v-icon class="mr-1" :icon="getRoleIcon(item.role)" size="small" />
            {{ item.role }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'active' ? 'success' : 'error'"
            size="small"
            variant="flat"
          >
            <v-icon
              class="mr-1"
              :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-close-circle'"
              size="small"
            />
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip location="top" text="Ver detalhes">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="mr-1"
                color="info"
                icon="mdi-eye"
                size="small"
                variant="tonal"
                @click="$emit('view', item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Editar usuário">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="mr-1"
                color="primary"
                icon="mdi-pencil"
                size="small"
                variant="tonal"
                @click="$emit('edit', item)"
              />
            </template>
          </v-tooltip>

          <v-tooltip location="top" text="Excluir usuário">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                icon="mdi-delete"
                size="small"
                variant="tonal"
                @click="$emit('delete', item)"
              />
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import type { User } from '@/interfaces'
  import { getRoleColor, getRoleIcon } from '@/utils/tramposes'
  import { filterUsers, roleFilterOptions, statusFilterOptions, userTableHeaders } from '@/utils/tramposes/userFilters'

  export default {
    name: 'UsersTable',
    props: {
      users: {
        type: Array as () => User[],
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      search: {
        type: String,
        default: '',
      },
      filterRole: {
        type: String,
        default: 'Todos',
      },
      filterStatus: {
        type: String,
        default: 'Todos',
      },
    },
    emits: ['update:search', 'update:filterRole', 'update:filterStatus', 'refresh', 'view', 'edit', 'delete'],
    data () {
      return {
        searchLocal: this.search,
        filterRoleLocal: this.filterRole,
        filterStatusLocal: this.filterStatus,
        headers: userTableHeaders,
        roleFilterOptions,
        statusFilterOptions,
      }
    },
    computed: {
      filteredUsers (): User[] {
        return filterUsers(this.users, this.searchLocal, this.filterRoleLocal, this.filterStatusLocal)
      },
    },
    watch: {
      search (newVal) {
        this.searchLocal = newVal
      },
      filterRole (newVal) {
        this.filterRoleLocal = newVal
      },
      filterStatus (newVal) {
        this.filterStatusLocal = newVal
      },
    },
    methods: {
      onSearchChange () {
        this.$emit('update:search', this.searchLocal)
      },
      onFiltersChange () {
        this.$emit('update:filterRole', this.filterRoleLocal)
        this.$emit('update:filterStatus', this.filterStatusLocal)
      },
      getRoleColor,
      getRoleIcon,
    },
  }
</script>

<style scoped>
.main-card {
  border-radius: 12px;
}
</style>
