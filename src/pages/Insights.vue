<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BarChart, PieChart, TrendingUp, Calendar } from 'lucide-vue-next';
import { statsService } from '@/services/statsService';

const isLoading = ref(true);
const weeklyData = ref<{ day: string, focus: number, distracted: number }[]>([]);
const distribution = ref<{ label: string, value: number, color: string }[]>([]);
const streak = ref(0);
const productivityScore = ref(0);

const maxVal = ref(6);

onMounted(async () => {
    try {
        const data = await statsService.getInsightsData(7);
        weeklyData.value = data.weeklyData;
        distribution.value = data.distribution;
        streak.value = data.streak;
        productivityScore.value = data.productivityScore;

        // Calculate dynamic max value for charts
        const maxFocus = Math.max(...data.weeklyData.map(d => d.focus));
        const maxDistracted = Math.max(...data.weeklyData.map(d => d.distracted));
        const max = Math.max(maxFocus, maxDistracted);
        maxVal.value = max > 0 ? Math.ceil(max * 1.2) : 6;

    } catch (e) {
        console.error("Error loading insights", e);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
  <div class="p-4 lg:p-8 h-full overflow-y-auto custom-scrollbar">
    <header class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Insights</h2>
      <p class="text-slate-400">Understand your productivity patterns over time.</p>
    </header>

     <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Weekly Activity Chart -->
        <div class="bg-surface rounded-2xl p-6 border border-white/5 flex flex-col h-80">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-white flex items-center gap-2">
                    <BarChart class="w-5 h-5 text-primary" /> Weekly Activity
                </h3>
                <div class="text-xs font-medium bg-white/5 px-2 py-1 rounded text-slate-400">Last 7 Days</div>
            </div>
            
            <div class="flex-1 flex items-end justify-between gap-2 px-2">
                <div v-for="d in weeklyData" :key="d.day" class="flex flex-col items-center gap-2 flex-1 group relative">
                    <!-- Tooltip -->
                    <div class="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10 border border-white/10">
                        Focus: {{ d.focus }}h<br>Distracted: {{ d.distracted }}h
                    </div>

                    <!-- Bars -->
                    <div class="w-full flex-1 flex items-end justify-center gap-1">
                        <div class="w-3 bg-primary rounded-t-sm transition-all hover:brightness-110" :style="{ height: `${(d.focus / maxVal) * 100}%` }"></div>
                        <div class="w-3 bg-rose-500/50 rounded-t-sm transition-all hover:brightness-110" :style="{ height: `${(d.distracted / maxVal) * 100}%` }"></div>
                    </div>
                    
                    <span class="text-xs text-slate-500 font-medium">{{ d.day }}</span>
                </div>
            </div>
        </div>

        <!-- Category Distribution -->
        <div class="bg-surface rounded-2xl p-6 border border-white/5 flex flex-col h-80">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-white flex items-center gap-2">
                    <PieChart class="w-5 h-5 text-secondary" /> Category Split
                </h3>
            </div>
            
            <div class="flex-1 flex flex-col justify-center gap-6">
                <div v-for="cat in distribution" :key="cat.label" class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-300 font-medium">{{ cat.label }}</span>
                        <span class="text-slate-400">{{ cat.value }}%</span>
                    </div>
                    <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-1000" :class="cat.color" :style="{ width: `${cat.value}%` }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl">
            <TrendingUp class="w-8 h-8 text-indigo-400 mb-4" />
            <div class="text-3xl font-bold text-white mb-1">Top {{ productivityScore }}%</div>
            <div class="text-indigo-200 text-sm">Productivity Score vs. Average</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 rounded-2xl">
            <Calendar class="w-8 h-8 text-emerald-400 mb-4" />
            <div class="text-3xl font-bold text-white mb-1">{{ streak }} Days</div>
            <div class="text-emerald-200 text-sm">Current Streak</div>
        </div>
    </div>
  </div>
</template>
