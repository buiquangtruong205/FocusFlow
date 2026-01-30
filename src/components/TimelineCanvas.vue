<script setup lang="ts">
import { useTimelineStore } from '@/stores/timelineStore';
import { computed, ref } from 'vue';

const store = useTimelineStore();
const containerRef = ref<HTMLElement | null>(null);

// Constants
const PIXELS_PER_HOUR = computed(() => {
    switch (store.zoomLevel) {
        case '6h': return 300; // Large zoom
        case '12h': return 150;
        case '24h': default: return 80; // Compact
    }
});

const HOUR_HEIGHT = computed(() => PIXELS_PER_HOUR.value);
const TOTAL_HEIGHT = computed(() => HOUR_HEIGHT.value * 24);

// Time Markers (00:00 - 23:00)
const timeMarkers = Array.from({ length: 25 }, (_, i) => i);

function getBlockStyle(segment: any) {
    const start = new Date(segment.startTime);
    const end = new Date(segment.endTime);
    
    // Calculate minutes from start of day (00:00)
    // Note: This relies on startTime being correct ISO date for the current view day
    // For MVP we assume data is correct. in Prod, need robust normalization.
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    const top = (startMinutes / 60) * HOUR_HEIGHT.value;
    const height = (durationMinutes / 60) * HOUR_HEIGHT.value;

    return {
        top: `${top}px`,
        height: `${Math.max(height, 24)}px`, // Min height for visibility
    };
}

function getCategoryColor(cat: string) {
    switch(cat) {
        case 'WORK': return 'bg-indigo-500';
        case 'COMM': return 'bg-pink-500';
        case 'ENT': return 'bg-violet-500';
        case 'OTHER': return 'bg-slate-500';
        default: return 'bg-slate-700'; 
    }
}

function formatDuration(ms: number) {
    if (ms < 60000) return `${Math.round(ms/1000)}s`;
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
}

function getNowPosition() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const top = (mins / 60) * HOUR_HEIGHT.value;
    return `${top}px`;
}

import { onMounted, watch, nextTick } from 'vue';

onMounted(() => {
    scrollToBottom();
});

watch(() => store.timelineDays, () => {
    scrollToBottom();
}, { deep: true });

function scrollToBottom() {
    nextTick(() => {
        if (containerRef.value) {
            containerRef.value.scrollTop = containerRef.value.scrollHeight;
        }
    });
}
</script>

<template>
  <div class="relative w-full h-full overflow-y-auto custom-scrollbar scroll-smooth" ref="containerRef">
    <div class="flex flex-col pb-20">
        <div v-for="day in store.filteredTimelineDays" :key="day.date" class="relative w-full mb-8">
            
            <!-- Day Header -->
            <div class="sticky top-0 z-30 bg-background/95 backdrop-blur border-y border-white/5 py-2 px-4 flex items-center gap-2 shadow-sm">
                <span class="font-bold text-white">{{ new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) }}</span>
                <span v-if="day.date === new Date().toISOString().split('T')[0]" class="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Today</span>
            </div>

            <!-- Canvas Container -->
            <div class="relative w-full" :style="{ height: `${TOTAL_HEIGHT}px` }">
                
                <!-- Background Grid (Time Slots) -->
                <div 
                    v-for="hour in timeMarkers" 
                    :key="hour" 
                    class="absolute w-full border-t border-white/5 flex items-start"
                    :style="{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }"
                >
                    <span class="text-xs text-slate-600 font-mono translate-y-[-50%] px-4 w-16 text-right select-none">
                        {{ String(hour).padStart(2, '0') }}:00
                    </span>
                </div>

                <!-- Event Blocks -->
                <div class="absolute inset-0 ml-16 mr-4"> <!-- Offset for time labels -->
                    <div 
                        v-for="segment in day.segments" 
                        :key="segment.id"
                        class="absolute left-2 right-2 rounded-lg border border-white/5 overflow-hidden cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:z-10 group"
                        :class="[
                            segment.kind === 'IDLE' ? 'bg-stripes-white/5 border-dashed opacity-50' : 'bg-surface',
                            store.selectedSegmentId === segment.id ? 'ring-2 ring-primary z-20 shadow-xl' : '',
                            segment.focusState === 'FOCUS' ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : '',
                            segment.focusState === 'DISTRACTED' ? 'ring-1 ring-rose-500/50 bg-rose-500/5' : ''
                        ]"
                        :style="getBlockStyle(segment)"
                        @click.stop="store.selectSegment(segment.id)"
                    >
                        <!-- Color Strip -->
                        <div class="absolute left-0 top-0 bottom-0 w-1" :class="getCategoryColor(segment.category)"></div>
                        
                        <!-- Content -->
                        <div class="pl-3 p-2 h-full flex flex-col justify-center">
                            <!-- Title Row -->
                            <div class="flex items-center gap-2">
                                <span v-if="segment.focusState === 'FOCUS'" class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1 rounded uppercase tracking-wider">Focus</span>
                                <span v-if="segment.focusState === 'DISTRACTED'" class="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-1 rounded uppercase tracking-wider">Distracted</span>
                                
                                <h4 class="text-sm font-medium text-white truncate flex-1">
                                    {{ segment.kind === 'IDLE' ? 'Idle Time' : segment.app?.displayName || 'Unknown App' }}
                                </h4>
                                <!-- Always visible duration -->
                                <span class="text-xs font-mono text-slate-400 bg-black/20 px-1.5 rounded">
                                    {{ formatDuration(segment.durationMs) }}
                                </span>
                            </div>
                            
                            <!-- Meta Row (Visible on larger blocks or hover) -->
                            <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5" v-if="parseFloat(getBlockStyle(segment).height) > 30">
                                <span>{{ new Date(segment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} - {{ new Date(segment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                                <span v-if="segment.kind !== 'IDLE'" class="opacity-50">• {{ segment.category }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Current Time Indicator (Only if Today) -->
                <div v-if="day.date === new Date().toISOString().split('T')[0]" class="absolute w-full border-t-2 border-primary z-30 pointer-events-none flex items-center" :style="{ top: getNowPosition() }">
                    <div class="w-2 h-2 rounded-full bg-primary -translate-y-[50%] ml-[60px]"></div>
                    <span class="text-xs font-bold text-primary bg-background px-1 rounded ml-2 -translate-y-[50%]">Now</span>
                </div>

            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.bg-stripes-white\/5 {
  background-image: linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent);
  background-size: 1rem 1rem;
}
</style>
