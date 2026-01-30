<script setup lang="ts">
import { 
  LayoutDashboard, 
  Clock, 
  Target, 
  LineChart, 
  Settings,
  MessageSquare
} from 'lucide-vue-next'
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRouteName = computed(() => route.name);

const menuItems = [
  { name: 'Today', path: '/', icon: LayoutDashboard },
  { name: 'Timeline', path: '/timeline', icon: Clock },
  { name: 'Focus', path: '/focus', icon: Target },
  { name: 'Insights', path: '/insights', icon: LineChart },
  { name: 'Advice', path: '/advice', icon: MessageSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
]
</script>

<template>
  <aside class="flex flex-col h-full bg-surface/50 backdrop-blur-md pt-6 pb-4 px-3 flex items-center lg:items-stretch">
    <!-- Logo area -->
    <div class="mb-10 px-2 flex items-center justify-center lg:justify-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Target class="w-6 h-6 text-white" />
        </div>
        <h1 class="hidden lg:block font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FocusFlow</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 w-full space-y-2">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
        :class="[
          currentRouteName === item.name 
            ? 'bg-white/10 text-white shadow-inner font-medium' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        ]"
      > 
        <!-- Active Indicator for Focus Tab (Special Treatment) -->
        <div v-if="item.name === 'Focus' && currentRouteName === 'Focus'" class="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/10 opacity-100" />
        
        <component 
            :is="item.icon" 
            class="w-6 h-6 z-10"
            :class="item.name === 'Focus' ? 'text-primary' : ''"
        />
        <span class="hidden lg:block z-10">{{ item.name }}</span>
        
        <!-- Hover effect -->
        <span class="hidden lg:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
        </span>
      </router-link>
    </nav>
    
    <!-- User/Status (Future) -->
    <div class="mt-auto pt-4 border-t border-white/5">
        <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mx-auto lg:mx-0">
            US
        </div>
    </div>
  </aside>
</template>
