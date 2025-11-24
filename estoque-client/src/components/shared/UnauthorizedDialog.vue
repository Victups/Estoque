<template>
  <v-dialog :model-value="modelValue" max-width="500" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card elevation="8">
      <v-card-title class="bg-warning pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="white" icon="mdi-lock-alert" size="32" />
          <span class="text-h5 text-white">Acesso Negado</span>
        </div>
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="warning" icon="mdi-shield-account-off" size="80" />
        </div>
        <p class="text-h6 text-center mb-2">
          Você não tem autorização para acessar esta funcionalidade
        </p>
        <p class="text-body-1 text-center text-medium-emphasis">
          {{ message || 'Entre em contato com um administrador do sistema para solicitar as permissões necessárias.' }}
        </p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="warning"
          variant="elevated"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon class="mr-1" icon="mdi-check" />
          Entendi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'UnauthorizedDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
}
</script>

