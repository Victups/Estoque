<template>
  <v-dialog v-model="dialog" max-width="700">
    <v-card v-if="user" elevation="8">
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="mr-2" icon="mdi-account-circle" size="30" />
            <span class="text-h5">Detalhes do Usuário</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="close" />
        </div>
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="text-center mb-6">
          <v-avatar class="mb-3" :color="user.avatarColor" size="100">
            <span class="text-h3 text-white font-weight-bold">{{ user.initials }}</span>
          </v-avatar>
          <h2 class="text-h4 mb-1">{{ user.name }}</h2>
          <p class="text-h6 text-grey">{{ user.email }}</p>
        </div>

        <v-divider class="mb-4" />

        <v-row>
          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-shield-account" />
              </template>
              <v-list-item-title class="font-weight-bold">Função</v-list-item-title>
              <v-list-item-subtitle>{{ user.role }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>
          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-information" />
              </template>
              <v-list-item-title class="font-weight-bold">Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="user.status === 'active' ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ user.status }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-col>
          <v-col cols="12" md="6">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary" icon="mdi-clock-outline" />
              </template>
              <v-list-item-title class="font-weight-bold">Último acesso</v-list-item-title>
              <v-list-item-subtitle>{{ user.lastAccess || 'N/A' }}</v-list-item-subtitle>
            </v-list-item>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { User } from '@/types'

export default {
  name: 'UserViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object as () => User | null,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    dialog: {
      get () {
        return this.modelValue
      },
      set (value: boolean) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    close () {
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

