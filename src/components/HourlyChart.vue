<script setup lang="ts">


interface DataPoint {
  label: string;
  value: number; // 0-100
}

defineProps<{
  data: DataPoint[];
}>();



// Simple mock chart implementation using CSS/Flex
// In a real app, use Chart.js or ECharts
</script>

<template>
  <div class="bg-surface rounded-2xl p-6 border border-white/5">
    <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-white text-lg">Activity Distribution</h3>
        <select class="bg-black/20 text-slate-400 text-sm border-none rounded-lg focus:ring-1 focus:ring-primary/50 py-1 px-3">
            <option>Today</option>
            <option>Week</option>
        </select>
    </div>

    <!-- Bar Chart Container -->
    <div class="flex items-end justify-between h-40 gap-2 mt-4">
        <div v-for="(item, index) in data" :key="index" class="flex flex-col items-center gap-2 flex-1 group">
            <div class="w-full bg-white/5 rounded-t-lg relative h-32 overflow-hidden">
                 <div 
                    class="absolute bottom-0 w-full transition-all duration-500 hover:opacity-90 rounded-t-sm"
                    :class="[ index % 2 === 0 ? 'bg-primary' : 'bg-secondary' ]"
                    :style="{ height: `${item.value}%` }"
                 >
                 </div>
                 <!-- Tooltip -->
                 <div class="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-1 transition-opacity">
                    <span class="text-xs font-bold text-white drop-shadow-md">{{ item.value }}%</span>
                 </div>
            </div>
            <span class="text-xs text-slate-500">{{ item.label }}</span>
        </div>
    </div>
  </div>
</template>
