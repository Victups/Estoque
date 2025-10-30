<template>
  <v-card class="stat-card" elevation="2">
    <v-card-text>
      <div class="d-flex align-center justify-space-between">
        <div>
          <p class="text-caption text-medium-emphasis mb-1">{{ label }}</p>
          <h2 class="text-h4 font-weight-bold" :class="`text-${color}`">
            {{ formattedValue }}
          </h2>
        </div>
        <v-avatar class="stat-icon" :color="color" size="56">
          <v-icon color="white" size="28">{{ icon }}</v-icon>
        </v-avatar>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
    color: {
      type: String,
      default: 'primary',
    },
    icon: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      default: 'number', // 'number', 'currency', 'locale'
    },
  },
  computed: {
    formattedValue () {
      if (this.format === 'currency') {
        return Number(this.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }
      if (this.format === 'locale') {
        return Number(this.value).toLocaleString('pt-BR')
      }
      return this.value
    },
  },
}
</script>

<style scoped>
.stat-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}
</style>

