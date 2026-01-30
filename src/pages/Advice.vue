<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Lightbulb, Quote } from 'lucide-vue-next';
import { api } from '@/services/api';

const currentAdvice = ref({
    text: "Focus is the key to productivity.",
    author: "FocusFlow"
});

const isLoading = ref(false);

async function refreshAdvice() {
    isLoading.value = true;
    try {
        const advice = await api.getDailyAdvice();
        if (advice) {
            currentAdvice.value = {
                text: advice.text,
                author: advice.author || 'Unknown'
            };
        }
    } catch (e) {
        console.error("Failed to load advice", e);
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    refreshAdvice();
});
</script>

<template>
  <div class="p-8 h-full flex flex-col max-w-5xl mx-auto">
    <header class="mb-10">
        <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Lightbulb class="w-8 h-8 text-yellow-400" />
            Daily Advice
        </h2>
        <p class="text-slate-400">Wisdom to guide your focus.</p>
    </header>

    <!-- Advice Frame -->
    <div class="flex-1 flex items-center justify-center p-4">
        <div class="relative max-w-2xl w-full">
            <!-- Decorative elements -->
            <div class="absolute -top-6 -left-6 text-primary/20">
                <Quote class="w-16 h-16 transform -scale-x-100" />
            </div>
            <div class="absolute -bottom-6 -right-6 text-primary/20">
                <Quote class="w-16 h-16" />
            </div>

            <!-- Card -->
            <div class="bg-surface/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
                
                <!-- Background gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
                
                <div class="relative z-10 text-center">
                    <p class="text-2xl md:text-3xl font-medium text-slate-100 leading-relaxed mb-8 italic font-serif">
                        "{{ currentAdvice.text }}"
                    </p>
                    
                    <div class="flex items-center justify-center gap-4">
                        <div class="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent w-24"></div>
                        <span class="text-primary font-bold tracking-wide uppercase text-sm">{{ currentAdvice.author }}</span>
                        <div class="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent w-24"></div>
                    </div>
                </div>

                <!-- Interaction -->
                <div class="mt-12 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        @click="refreshAdvice"
                        class="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>New Advice</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
