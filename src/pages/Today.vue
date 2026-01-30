<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTodayStore } from '@/stores/todayStore';
import { Clock, Zap, Target, Activity, RefreshCw, Play, Pause, AlertTriangle } from 'lucide-vue-next';
import StatCard from '@/components/StatCard.vue';
import TopApps from '@/components/TopApps.vue';
import CategoryBreakdown from '@/components/CategoryBreakdown.vue';
import MiniTimeline from '@/components/MiniTimeline.vue';

const store = useTodayStore();

onMounted(() => {
    store.loadData();
});

// Helper to format duration ms to "1h 30m"
function formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
}

// Compute values for UI
const activeTime = computed(() => formatDuration(store.summary?.activeMs || 0));
const focusTime = computed(() => formatDuration(store.summary?.focusMs || 0));

const distractedTime = computed(() => formatDuration(store.summary?.distractedMs || 0));

// Transform DTO to Component Props
const topAppsList = computed(() => {
    return store.topApps.map(app => ({
        name: app.displayName,
        duration: formatDuration(app.durationMs),
        percentage: Math.round((app.durationMs / (store.summary?.activeMs || 1)) * 100),
        color: app.category === 'WORK' ? '#6366F1' : (app.category === 'ENT' ? '#EC4899' : '#8B5CF6') 
    }));
});

const categoryData = computed(() => store.summary?.byCategoryMs || {});

// Mock Insight Data
const insights = [
    "You switched apps 42 times between 9:00 - 11:00 (High Distraction).",
    "Best focus block: 10:15 - 11:05 (50m)."
];
</script>

<template>
  <div class="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
    
    <!-- 1. Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div>
        <h2 class="text-3xl font-bold text-white mb-1 tracking-tight">Today</h2>
        <div class="flex items-center gap-3 text-sm">
            <span class="text-slate-400">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-600"></span>
            
            <!-- Tracking Status -->
            <div v-if="store.isTracking" class="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="font-medium text-emerald-400 uppercase text-[10px] tracking-wider">Tracking On</span>
            </div>
            <div v-else class="flex items-center gap-2 px-2 py-1 bg-slate-500/10 rounded-full border border-slate-500/20">
                 <span class="w-2 h-2 rounded-full bg-slate-500"></span>
                 <span class="font-medium text-slate-400 uppercase text-[10px] tracking-wider">Tracking Off</span>
            </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-3">
         <button 
            @click="store.isTracking ? store.stopTracking() : store.startTracking()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-lg"
            :class="store.isTracking ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'"
         >
            <component :is="store.isTracking ? Pause : Play" class="w-4 h-4 fill-current" />
            <span>{{ store.isTracking ? 'Stop Tracking' : 'Start Tracking' }}</span>
         </button>
         <button @click="store.refresh()" class="p-2 rounded-xl bg-surface border border-white/10 hover:bg-white/5 transition-colors text-slate-400">
            <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': store.isLoading }" />
         </button>
      </div>
    </header>
    
    <!-- 2. KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Active Time" 
        :value="activeTime" 
        :icon="Clock" 
        color="primary"
      />
      <StatCard 
        title="Focus Time" 
        :value="focusTime" 
        :icon="Target" 
        color="secondary"
        subtitle="Deep Work"
      />
       <StatCard 
        title="Distracted" 
        :value="distractedTime" 
        :icon="AlertTriangle" 
        color="danger"
        subtitle="Off-track"
      />
      <StatCard 
        title="Switches" 
        :value="store.summary?.switchCount || 0" 
        :icon="Activity" 
        color="accent"
        subtitle="Context Shifts"
      />
    </div>

    <!-- 3. Breakdown & Top Apps -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[28rem]">
        <CategoryBreakdown :categories="categoryData" />
        <TopApps :apps="topAppsList" />
    </div>

    <!-- 4. Mini Timeline -->
    <MiniTimeline />

    <!-- 5. Insights & Quick Actions Footer -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Insights -->
        <div class="lg:col-span-2 bg-gradient-to-br from-surface to-surface/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-center">
            <h4 class="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Zap class="w-4 h-4 text-amber-400" /> Daily Insights
            </h4>
            <ul class="space-y-2">
                <li v-for="(insight, i) in insights" :key="i" class="flex gap-3 text-slate-200">
                    <span class="text-primary mt-1">•</span>
                    {{ insight }}
                </li>
            </ul>
        </div>

        <!-- Secondary Actions -->
        <div class="bg-surface border border-white/5 p-5 rounded-2xl flex flex-col justify-center gap-3">
             <button class="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors text-left flex items-center justify-between group">
                Quick Block Apps
                <span class="text-slate-500 group-hover:text-white transition-colors">+</span>
             </button>
             <button class="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors text-left flex items-center justify-between group">
                Re-categorize Apps
                <span class="text-slate-500 group-hover:text-white transition-colors">→</span>
             </button>
        </div>
    </div>

  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}
</style>
