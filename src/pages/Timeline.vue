<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useTimelineStore } from '@/stores/timelineStore';
import TimelineControl from '@/components/TimelineControl.vue';
import TimelineCanvas from '@/components/TimelineCanvas.vue';
import EventDetailDrawer from '@/components/EventDetailDrawer.vue';

const store = useTimelineStore();
let refreshInterval: any;

onMounted(() => {
    store.loadTimeline();
    // Refresh every 10 seconds to show live activity
    refreshInterval = setInterval(() => {
        if (new Date().toISOString().startsWith(store.currentDate)) {
            store.loadTimeline();
        }
    }, 10000);
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <!-- Header Controls -->
    <TimelineControl @toggle-filters="() => {}" />
    
    <!-- Main Canvas Area -->
    <div class="flex-1 relative overflow-hidden bg-background/50">
        <TimelineCanvas />
        
        <!-- Loading Overlay -->
        <div v-if="store.isLoading" class="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
            <div class="flex flex-col items-center gap-3">
                 <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <span class="text-sm text-slate-400">Loading timeline...</span>
            </div>
        </div>
    </div>

    <!-- Detail Drawer (Slide-over) -->
    <EventDetailDrawer />
    
  </div>
</template>
