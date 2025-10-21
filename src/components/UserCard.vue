<template>
  <v-card class="user-card" elevation="3">
    <v-card-text>
      <div class="d-flex align-center">
        <v-avatar :color="user.avatarColor" size="60">
          <span class="text-h5 text-white font-weight-bold">
            {{ user.initials }}
          </span>
        </v-avatar>

        <div class="ml-4 flex-grow-1">
          <h3 class="text-h6 font-weight-bold">
            {{ user.name }}
          </h3>
          <p class="text-body-2 text-grey">
            {{ user.email }}
          </p>
          <div class="mt-2">
            <v-chip
              class="mr-2"
              :color="roleColor"
              size="small"
              variant="flat"
            >
              <v-icon class="mr-1" :icon="roleIcon" size="small" />
              {{ user.role }}
            </v-chip>
            <v-chip
              :color="statusColor"
              size="small"
              variant="flat"
            >
              {{ user.status }}
            </v-chip>
          </div>
        </div>

        <div class="d-flex flex-column gap-2">
          <v-btn
            color="info"
            icon="mdi-eye"
            size="small"
            variant="tonal"
            @click="emit('view', user)"
          />
          <v-btn
            color="primary"
            icon="mdi-pencil"
            size="small"
            variant="tonal"
            @click="emit('edit', user)"
          />
          <v-btn
            color="error"
            icon="mdi-delete"
            size="small"
            variant="tonal"
            @click="emit('delete', user)"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { User } from '@/types'
  import { computed } from 'vue'
  import { useUser } from '@/composables/useUser'

  interface Props {
    user: User
  }

  interface Emits {
    (event: 'view', user: User): void
    (event: 'edit', user: User): void
    (event: 'delete', user: User): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const userHelpers = useUser()

  const roleColor = computed<string>(() => {
    return userHelpers.getRoleColor(props.user.role)
  })

  const roleIcon = computed<string>(() => {
    return userHelpers.getRoleIcon(props.user.role)
  })

  const statusColor = computed<string>(() => {
    return props.user.status === 'active' ? 'success' : 'error'
  })
</script>

<style scoped>
.user-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
