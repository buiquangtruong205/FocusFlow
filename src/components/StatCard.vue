<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
}>();

const colorClass = computed(() => {
    switch (props.color) {
        case 'secondary': return 'text-secondary';
        case 'accent': return 'text-accent';
        case 'success': return 'text-emerald-400';
        case 'warning': return 'text-amber-400';
        case 'danger': return 'text-rose-400';
        default: return 'text-primary';
    }
});

const bgClass = computed(() => {
    switch (props.color) {
        case 'secondary': return 'bg-secondary/10';
        case 'accent': return 'bg-accent/10';
        case 'success': return 'bg-emerald-400/10';
        case 'warning': return 'bg-amber-400/10';
        case 'danger': return 'bg-rose-400/10';
        default: return 'bg-primary/10';
    }
});
</script>

<template>
  <div class="bg-surface rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors group">
    <div class="flex justify-between items-start mb-4">
      <div v-if="icon" class="p-2.5 rounded-xl" :class="bgClass">
        <component :is="icon" class="w-5 h-5" :class="colorClass" />
      </div>
      <div v-if="trend" class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5">
        <span :class="trend.isPositive ? 'text-emerald-400' : 'text-rose-400'">
          {{ trend.isPositive ? '+' : '' }}{{ trend.value }}%
        </span>
      </div>
    </div>
    
    <div>
      <h3 class="text-slate-400 font-medium text-sm mb-1">{{ title }}</h3>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl lg:text-3xl font-bold text-white tracking-tight">{{ value }}</span>
        <span v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>
