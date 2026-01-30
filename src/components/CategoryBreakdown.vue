<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  categories: Record<string, number>; // Category -> ms
}>();

const totalMs = computed(() => Object.values(props.categories).reduce((a, b) => a + b, 0));

const chartData = computed(() => {
    if (totalMs.value === 0) return [];
    
    const colors: Record<string, string> = {
        'WORK': '#6366F1', // Primary (Indigo)
        'COMM': '#EC4899', // Secondary (Pink)
        'ENT': '#8B5CF6',  // Accent (Violet)
        'OTHER': '#64748B', // Slate
        'UNCATEGORIZED': '#334155' 
    };

    return Object.entries(props.categories)
        .filter(([_, ms]) => ms > 0)
        .map(([cat, ms]) => ({
            label: cat,
            ms: ms,
            percent: Math.round((ms / totalMs.value) * 100),
            color: colors[cat] || colors['OTHER']
        }))
        .sort((a, b) => b.ms - a.ms);
});

function formatDuration(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
}
</script>

<template>
  <div class="bg-surface rounded-2xl p-6 border border-white/5 h-full flex flex-col">
    <h3 class="font-bold text-white text-lg mb-6">Category Breakdown</h3>
    
    <div class="flex flex-col gap-6 flex-1 min-h-0">
        <!-- Visual Bar -->
        <div class="flex h-4 w-full rounded-full overflow-hidden flex-shrink-0">
            <div 
                v-for="item in chartData" 
                :key="item.label"
                class="h-full hover:opacity-80 transition-opacity"
                :style="{ width: `${item.percent}%`, backgroundColor: item.color }"
                :title="`${item.label}: ${item.percent}%`"
            ></div>
        </div>

        <!-- Legend List -->
        <div class="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="item in chartData" :key="item.label" class="flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
                    <span class="text-slate-300 font-medium">{{ item.label }}</span>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <span class="text-slate-500">{{ formatDuration(item.ms) }}</span>
                    <span class="font-mono text-slate-400 w-8 text-right">{{ item.percent }}%</span>
                </div>
            </div>
             <div v-if="chartData.length === 0" class="text-center text-slate-500">No data yet</div>
        </div>
    </div>
  </div>
</template>
