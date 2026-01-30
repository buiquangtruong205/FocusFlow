<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore';
import { onMounted, computed } from 'vue';
import { Search, Monitor, Briefcase, MessageCircle, Music, Box } from 'lucide-vue-next';

const store = useSettingsStore();

onMounted(() => {
    store.loadApps();
});

const filteredApps = computed(() => {
    if (!store.searchQuery) return store.apps;
    return store.apps.filter(app => 
        app.name.toLowerCase().includes(store.searchQuery.toLowerCase())
    );
});

const categories = [
    { value: 'WORK', label: 'Work', icon: Briefcase, color: 'text-indigo-400' },
    { value: 'COMM', label: 'Communication', icon: MessageCircle, color: 'text-pink-400' },
    { value: 'ENT', label: 'Entertainment', icon: Music, color: 'text-violet-400' },
    { value: 'OTHER', label: 'Other', icon: Box, color: 'text-slate-400' },
];

function getIcon(cat: string) {
    return categories.find(c => c.value === cat)?.icon || Box;
}
</script>

<template>
  <div class="h-full flex flex-col p-6 overflow-hidden">
    <div class="mb-6 flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-white">App Rules</h2>
            <p class="text-slate-400 text-sm">Categorize your apps to track productivity accurately</p>
        </div>
        
        <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
                v-model="store.searchQuery"
                type="text" 
                placeholder="Search apps..." 
                class="pl-10 pr-4 py-2 bg-surface border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 w-64"
            />
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar bg-surface/30 rounded-xl border border-white/5">
        <div v-if="store.isLoading" class="p-8 text-center text-slate-500">Loading apps...</div>
        
        <table v-else class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-surface/95 backdrop-blur z-10 border-b border-white/5">
                <tr>
                    <th class="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Application</th>
                    <th class="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th class="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
                <tr v-for="app in filteredApps" :key="app.id" class="hover:bg-white/5 transition-colors group">
                    <td class="p-4 flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-slate-300">
                           <!-- Icon Placeholder (or real icon if available) -->
                           <img v-if="app.icon" :src="app.icon" class="w-full h-full object-contain" /> 
                           <Monitor v-else class="w-4 h-4" />
                        </div>
                        <span class="font-medium text-slate-200">{{ app.name }}</span>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            <component :is="getIcon(app.category)" class="w-4 h-4 opacity-70" />
                            <select 
                                :value="app.category"
                                @change="(e: any) => store.updateCategory(app.id, e.target.value)"
                                class="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer hover:text-white"
                            >
                                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                                    {{ cat.label }}
                                </option>
                                <option value="UNCATEGORIZED">Uncategorized</option>
                            </select>
                        </div>
                    </td>
                    <td class="p-4 text-right">
                         <!-- Toggle Blocked (Future) -->
                         <button class="text-xs text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                             Configure
                         </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>
