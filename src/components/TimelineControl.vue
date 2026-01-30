<script setup lang="ts">
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-vue-next';
import { useTimelineStore } from '@/stores/timelineStore';

const store = useTimelineStore();

const emit = defineEmits(['toggle-filters']);

function prevDay() {
    const d = new Date(store.currentDate);
    d.setDate(d.getDate() - 1);
    store.currentDate = d.toISOString().split('T')[0];
    store.loadTimeline();
}

function nextDay() {
    const d = new Date(store.currentDate);
    d.setDate(d.getDate() + 1);
    store.currentDate = d.toISOString().split('T')[0];
    store.loadTimeline();
}

function setToToday() {
    store.currentDate = new Date().toISOString().split('T')[0];
    store.loadTimeline();
}
</script>

<template>
  <div class="flex flex-col gap-4 bg-surface/50 border-b border-white/5 p-4 backdrop-blur-md sticky top-0 z-20">
    <div class="flex items-center justify-between">
        <!-- Date Navigation -->
        <div class="flex items-center gap-3 bg-white/5 p-1 rounded-lg">
            <button @click="prevDay" class="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                <ChevronLeft class="w-5 h-5" />
            </button>
            <div class="flex flex-col items-center min-w-[120px] cursor-pointer" @click="setToToday">
                <span class="text-sm font-bold text-white">{{ store.currentDate }}</span>
                <span class="text-[10px] text-slate-500 uppercase font-medium">
                    {{ store.currentDate === new Date().toISOString().split('T')[0] ? 'Today' : 'History' }}
                </span>
            </div>
            <button @click="nextDay" class="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                <ChevronRight class="w-5 h-5" />
            </button>
        </div>

        <!-- Right Controls -->
        <div class="flex items-center gap-3">
             <!-- Zoom Control -->
            <div class="bg-white/5 rounded-lg flex text-xs font-medium p-1">
                <button 
                    v-for="zoom in ['24h', '12h', '6h']" :key="zoom"
                    @click="store.setZoom(zoom as any)"
                    class="px-2 py-1 rounded transition-colors"
                    :class="store.zoomLevel === zoom ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'"
                >
                    {{ zoom }}
                </button>
            </div>

            <div class="h-6 w-px bg-white/10 mx-1"></div>

            <!-- Search -->
            <div class="relative group">
                <Search class="absolute left-2 top-1.5 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                    v-model="store.searchQuery"
                    type="text" 
                    placeholder="Search app..." 
                    class="bg-white/5 border border-transparent focus:border-primary/50 text-white text-sm pl-8 pr-3 py-1.5 rounded-lg w-40 focus:w-60 focus:bg-white/10 transition-all outline-none placeholder:text-slate-600"
                >
            </div>
            
            <!-- Filter Toggle -->
            <button 
                @click="emit('toggle-filters')" 
                class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-white/10"
                :class="{ 'bg-primary/10 text-primary border-primary/20': store.filters.categories.length > 0 || store.filters.hideIdle }"
            >
                <SlidersHorizontal class="w-5 h-5" />
            </button>
        </div>
    </div>
  </div>
</template>
