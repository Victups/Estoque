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
            @click="handleView"
          />
          <v-btn
            color="primary"
            icon="mdi-pencil"
            size="small"
            variant="tonal"
            @click="handleEdit"
          />
          <v-btn
            color="error"
            icon="mdi-delete"
            size="small"
            variant="tonal"
            @click="handleDelete"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { User } from '@/types'
import { getRoleColor, getRoleIcon } from '@/utils/tramposes'

export default defineComponent({
  name: 'UserCard',
  props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
  emits: ['view', 'edit', 'delete'],
  computed: {
    roleColor (): string {
      return getRoleColor(this.user.role)
    },
    roleIcon (): string {
      return getRoleIcon(this.user.role)
    },
    statusColor (): string {
      return this.user.status === 'active' ? 'success' : 'error'
    },
  },
  methods: {
    handleView () {
      this.$emit('view', this.user)
    },
    handleEdit () {
      this.$emit('edit', this.user)
    },
    handleDelete () {
      this.$emit('delete', this.user)
    },
  },
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
