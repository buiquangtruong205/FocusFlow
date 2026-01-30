<script setup lang="ts">
import { useTimelineStore } from '@/stores/timelineStore';
import { X, Clock, Tag, ShieldAlert, ShieldCheck } from 'lucide-vue-next';
import { computed } from 'vue';

const store = useTimelineStore();

const segment = computed(() => store.selectedSegment);

function close() {
    store.selectSegment(null);
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function duration(ms: number) {
    const min = Math.round(ms / 60000);
    return `${min} min`;
}
</script>

<template>
  <div 
    class="fixed top-0 right-0 h-full w-80 bg-surface border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
    :class="segment ? 'translate-x-0' : 'translate-x-full'"
  >
    <div v-if="segment" class="h-full flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-white/5 flex items-start justify-between">
            <div class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg font-bold">
                    {{ segment.app?.displayName.charAt(0) || '?' }}
                 </div>
                 <div>
                     <h3 class="font-bold text-white text-lg leading-tight">{{ segment.app?.displayName || 'Idle Time' }}</h3>
                     <span class="text-xs text-slate-500 uppercase tracking-wider">{{ segment.category }}</span>
                 </div>
            </div>
            <button @click="close" class="text-slate-500 hover:text-white transition-colors">
                <X class="w-6 h-6" />
            </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
            
            <!-- Time Info -->
            <div class="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
                <div class="flex items-center gap-3">
                    <Clock class="w-5 h-5 text-primary" />
                    <div>
                        <div class="text-white font-medium">{{ duration(segment.durationMs) }}</div>
                        <div class="text-xs text-slate-500">{{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}</div>
                    </div>
                </div>
            </div>

            <!-- Focus Status -->
            <div v-if="segment.focusState" class="p-4 rounded-xl border"
                :class="segment.focusState === 'FOCUS' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'"
            >
                <div class="flex items-center gap-2 mb-2">
                    <component :is="segment.focusState === 'FOCUS' ? ShieldCheck : ShieldAlert" class="w-5 h-5" :class="segment.focusState === 'FOCUS' ? 'text-emerald-400' : 'text-rose-400'" />
                    <span class="font-bold" :class="segment.focusState === 'FOCUS' ? 'text-emerald-400' : 'text-rose-400'">
                        {{ segment.focusState === 'FOCUS' ? 'Focus Session' : 'Distraction' }}
                    </span>
                </div>
                <p class="text-sm text-slate-300 opacity-80">
                    {{ segment.focusState === 'FOCUS' 
                        ? 'Great job! This session counted towards your focus goal.' 
                        : 'Review this app usage. It was flagged as distraction during a session.'
                    }}
                </p>
            </div>

             <!-- Actions -->
            <div class="space-y-3 pt-4 border-t border-white/5">
                <h4 class="text-sm font-medium text-slate-400 mb-2">Quick Actions</h4>
                
                <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                    <Tag class="w-4 h-4 text-slate-500 group-hover:text-primary" />
                    <span class="text-sm text-slate-300">Change Category</span>
                </button>
                
                 <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                    <ShieldAlert class="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
                    <span class="text-sm text-slate-300">Block this app during Focus</span>
                </button>
            </div>

        </div>
    </div>
  </div>
</template>
