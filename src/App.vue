<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { onMounted } from 'vue';

onMounted(async () => {
  // Start tracking automatically on app launch
  await window.electronAPI.startTracking();
  console.log('Tracking started');
});
</script>

<template>
  <div class="flex h-screen w-full bg-background text-slate-100 overflow-hidden pt-8">
    <!-- Custom Title Bar / Drag Region -->
    <div class="fixed top-0 left-0 w-full h-8 z-50 flex items-center justify-center pointer-events-none" style="-webkit-app-region: drag">
      <!-- Optional: Title if needed, centered -->
      <!-- <span class="text-xs text-slate-500 font-medium tracking-wider">FocusFlow</span> -->
    </div>

    <!-- Sidebar -->
    <Sidebar class="w-20 lg:w-64 flex-shrink-0 border-r border-white/5" />
    
    <!-- Main Content -->
    <main class="flex-1 overflow-auto bg-background/50 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
