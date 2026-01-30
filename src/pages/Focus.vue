<script setup lang="ts">
import { useFocusStore } from '@/stores/focusStore';
import { Play, Pause, Square, Timer, CheckCircle, RotateCcw } from 'lucide-vue-next';

const store = useFocusStore();

const presets = [15, 25, 45, 60];

async function startSessionWithValidation() {
    if (!store.taskTitle.trim()) {
        // Optional: Shake animation or focus input
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
        return;
    }
    try {
         await store.startSession();
    } catch (e: any) {
        alert("Failed to start session: " + (e.message || e));
    }
}
</script>

<template>
  <div class="h-full w-full p-8 relative flex flex-col items-center justify-center">
    
    <transition name="fade" mode="out-in">
        
        <!-- SETUP VIEW -->
        <div v-if="store.sessionState === 'SETUP'" class="w-full max-w-md flex flex-col gap-8 items-center" key="setup">
            <div class="text-center space-y-2">
                <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Focus Session</h2>
                <p class="text-slate-400">Choose your duration and goal</p>
            </div>

            <div class="w-full space-y-4">
                <label class="text-sm font-medium text-slate-300 ml-1">What are you working on?</label>
                <input 
                    v-model="store.taskTitle"
                    type="text" 
                    placeholder="e.g., Finish Project Report" 
                    class="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                    @keyup.enter="store.startSession"
                />
            </div>

            <div class="w-full space-y-4">
                 <label class="text-sm font-medium text-slate-300 ml-1">Duration (minutes)</label>
                 <div class="grid grid-cols-4 gap-3">
                     <button 
                        v-for="min in presets" 
                        :key="min"
                        @click="store.setDuration(min)"
                        class="py-2 rounded-lg border transition-all text-sm font-medium"
                        :class="store.durationMinutes === min ? 'bg-primary text-white border-primary' : 'bg-surface/30 border-white/5 text-slate-400 hover:bg-surface/50'"
                     >
                        {{ min }}m
                     </button>
                 </div>
                 <!-- Custom Input -->
                 <div class="flex items-center gap-2 mt-2">
                     <span class="text-xs text-slate-500 uppercase tracking-widest">Custom</span>
                     <input 
                        type="number" 
                        v-model.number="store.durationMinutes"
                        min="1"
                        class="bg-transparent border-b border-white/10 w-12 text-center text-white focus:outline-none focus:border-primary"
                     />
                 </div>
            </div>

            <button 
                @click="startSessionWithValidation"
                class="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                :class="store.taskTitle.trim() ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]' : 'bg-surface border border-white/10 text-slate-500 hover:bg-white/5'"
            >
                <div v-if="!store.taskTitle.trim()" class="absolute inset-0 flex items-center justify-center bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                    Enter a goal to start
                </div>
                <div class="flex items-center gap-2 group-hover:opacity-0 transition-opacity" :class="{ 'opacity-100': store.taskTitle.trim() }">
                    <Play class="w-5 h-5 fill-current" />
                    Start Focus
                </div>
            </button>
        </div>

        <!-- RUNNING / PAUSED VIEW -->
        <div v-else-if="store.sessionState === 'RUNNING' || store.sessionState === 'PAUSED'" class="flex flex-col items-center gap-12" key="running">
            
            <div class="text-center space-y-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400 mb-2">
                    <Timer class="w-3 h-3" />
                    <span>Focusing on</span>
                </div>
                <h2 class="text-2xl font-bold text-white max-w-xl leading-relaxed">{{ store.taskTitle }}</h2>
            </div>

            <!-- Timer Circle -->
            <div class="relative w-72 h-72 flex items-center justify-center">
                <!-- Outer Glow -->
                <div class="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse"></div>
                
                <!-- SVG Ring -->
                <svg class="w-full h-full -rotate-90 transform">
                    <circle cx="144" cy="144" r="130" stroke="currentColor" stroke-width="8" fill="transparent" class="text-surface/50" />
                    <circle 
                        cx="144" cy="144" r="130" 
                        stroke="currentColor" 
                        stroke-width="8" 
                        fill="transparent" 
                        class="text-primary transition-all duration-1000 ease-linear"
                        :stroke-dasharray="2 * Math.PI * 130"
                        :stroke-dashoffset="2 * Math.PI * 130 * (1 - store.progress / 100)"
                        stroke-linecap="round"
                    />
                </svg>

                <div class="absolute flex flex-col items-center">
                    <span class="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">
                        {{ store.formattedTime }}
                    </span>
                    <span class="text-sm font-medium text-primary mt-2 uppercase tracking-widest" v-if="store.sessionState === 'PAUSED'">Paused</span>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-6">
                <button 
                    v-if="store.sessionState === 'RUNNING'"
                    @click="store.pauseTimer"
                    class="p-4 rounded-full bg-surface border border-white/10 hover:bg-white/5 transition-all group"
                    title="Pause"
                >
                    <Pause class="w-8 h-8 text-slate-200 group-hover:text-white fill-current" />
                </button>
                <button 
                    v-else
                    @click="store.resumeTimer"
                    class="p-4 rounded-full bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all text-white"
                    title="Resume"
                >
                    <Play class="w-8 h-8 fill-current" />
                </button>

                <button 
                    @click="store.stopSession"
                    class="p-4 rounded-full bg-surface border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500 transition-all text-slate-400"
                    title="Stop Session"
                >
                    <Square class="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>

        <!-- COMPLETED VIEW -->
        <div v-else-if="store.sessionState === 'COMPLETED'" class="flex flex-col items-center gap-8" key="completed">
            <div class="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle class="w-12 h-12 text-emerald-500" />
            </div>
            
            <div class="text-center space-y-2">
                <h2 class="text-3xl font-bold text-white">Session Completed!</h2>
                <p class="text-slate-400">Great job working on "{{ store.taskTitle }}"</p>
            </div>

            <div class="flex gap-4">
                <div class="p-4 rounded-xl bg-surface border border-white/5 text-center min-w-[120px]">
                    <div class="text-2xl font-bold text-white">{{ store.durationMinutes }}m</div>
                    <div class="text-xs text-slate-500 uppercase tracking-wider">Focus Time</div>
                </div>
                <!-- Future features -->
            </div>

            <button 
                @click="store.reset"
                class="mt-8 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 transition-all"
            >
                <RotateCcw class="w-4 h-4" />
                Start New Session
            </button>
        </div>

    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
