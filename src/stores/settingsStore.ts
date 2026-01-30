import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export const useSettingsStore = defineStore('settings', () => {
    const apps = ref<any[]>([]);
    const isLoading = ref(false);
    const searchQuery = ref('');

    async function loadApps() {
        isLoading.value = true;
        try {
            apps.value = await api.getAllApps();
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    }

    async function updateCategory(appId: string, category: string) {
        // Optimistic update
        const app = apps.value.find(a => a.id === appId);
        if (app) app.category = category;

        try {
            await api.updateAppCategory(appId, category);
        } catch (error) {
            console.error(error);
            // Revert?
        }
    }

    return {
        apps,
        isLoading,
        searchQuery,
        loadApps,
        updateCategory
    };
});
