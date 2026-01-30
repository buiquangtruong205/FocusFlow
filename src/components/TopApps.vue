<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';

interface AppUsage {
  name: string;
  duration: string;
  icon?: string; // URL or name
  percentage: number;
  color: string;
}

const props = defineProps<{
  apps?: AppUsage[];
}>();

const displayApps = computed(() => props.apps || []);
</script>

<template>
  <div class="bg-surface rounded-2xl p-6 border border-white/5 h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-white text-lg">Top Apps Today</h3>
        <router-link to="/timeline" class="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
            View all <ArrowRight class="w-3 h-3" />
        </router-link>
    </div>
    
    <div class="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <div v-for="app in displayApps" :key="app.name" class="group">
            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                    <!-- Icon Placeholder -->
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10" :style="{ backgroundColor: app.color }">
                        {{ app.name.charAt(0) }}
                    </div>
                    <div>
                        <div class="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors">{{ app.name }}</div>
                        <div class="text-xs text-slate-500">{{ app.duration }}</div>
                    </div>
                </div>
                <div class="text-sm font-medium text-slate-400">{{ app.percentage }}%</div>
            </div>
            <!-- Progress Bar -->
            <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    class="h-full rounded-full opacity-80 group-hover:opacity-100 transition-all duration-300 relative overflow-hidden" 
                    :style="{ width: `${app.percentage}%`, backgroundColor: app.color }"
                >
                    <div class="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                </div>
            </div>
        </div>
        
        <div v-if="displayApps.length === 0" class="text-center text-slate-500 py-10">
            No data available
        </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
</style>
