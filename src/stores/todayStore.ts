import { defineStore } from 'pinia';
import { ref } from 'vue';
import { statsService } from '@/services/statsService';
import type { DailySummaryDTO, TopAppDTO } from '../../shared/types';

export const useTodayStore = defineStore('today', () => {
    // State
    const currentDate = ref(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const summary = ref<DailySummaryDTO | null>(null);
    const topApps = ref<TopAppDTO[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const isTracking = ref(false);

    // Actions
    async function loadData() {
        isLoading.value = true;
        error.value = null;
        try {
            const [summaryData, appsData] = await Promise.all([
                statsService.getDailySummary(currentDate.value),
                statsService.getTopApps(currentDate.value, 5)
            ]);
            summary.value = summaryData;
            topApps.value = appsData;
        } catch (err: any) {
            error.value = err.message || 'Failed to load today dashboard data';
        } finally {
            isLoading.value = false;
        }
    }

    function refresh() {
        return loadData();
    }

    function setDate(date: string) {
        currentDate.value = date;
        loadData();
    }

    async function startTracking() {
        try {
            await window.electronAPI.startTracking();
            isTracking.value = true;
            listenForUpdates();
        } catch (err) {
            console.error('Failed to start tracking', err);
        }
    }

    async function stopTracking() {
        try {
            await window.electronAPI.stopTracking();
            isTracking.value = false;
        } catch (err) {
            console.error('Failed to stop tracking', err);
        }
    }

    function listenForUpdates() {
        window.electronAPI.onActivityUpdate((data) => {
            // Update stats locally for immediate feedback
            if (summary.value) {
                summary.value.activeMs += 2000; // Assume 2s interval

                // Update Top Apps
                let appName = data.owner?.name || data.title || 'Unknown';

                // Consistency fix for dev mode
                if (appName === 'Electron' || appName === 'electron') {
                    appName = 'FocusFlow';
                }

                const existing = topApps.value.find(a => a.displayName === appName);
                if (existing) {
                    existing.durationMs += 2000;
                } else {
                    topApps.value.push({
                        appId: data.owner?.bundleId || 'unknown',
                        displayName: appName,
                        durationMs: 2000,
                        category: 'UNCATEGORIZED'
                    });
                }

                // Sort top apps
                topApps.value.sort((a, b) => b.durationMs - a.durationMs);
            }
        });
    }

    return {
        currentDate,
        summary,
        topApps,
        isLoading,
        error,
        isTracking,
        loadData,
        refresh,
        setDate,
        startTracking,
        stopTracking
    };
});
