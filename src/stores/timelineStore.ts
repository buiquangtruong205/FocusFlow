import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import type { TimelineDTO } from '../../shared/types';

export const useTimelineStore = defineStore('timeline', () => {
    const currentDate = ref(new Date().toISOString().split('T')[0]);
    const timelineDays = ref<TimelineDTO[]>([]);
    const isLoading = ref(false);

    // UI State
    const zoomLevel = ref<'6h' | '12h' | '24h'>('24h');
    const selectedSegmentId = ref<string | null>(null);
    const filterCategory = ref<string | null>(null); // Legacy (kept for safety)

    // New Filters supporting TimelineControl
    const searchQuery = ref('');
    const filters = ref({
        hideIdle: false,
        categories: [] as string[]
    });

    const filteredTimelineDays = computed(() => {
        if (!timelineDays.value.length) return [];

        return timelineDays.value.map(day => {
            let segments = day.segments;

            // 1. Text Search (App Name)
            if (searchQuery.value) {
                const lower = searchQuery.value.toLowerCase();
                segments = segments.filter(s =>
                    (s.app?.displayName || 'Unknown').toLowerCase().includes(lower)
                );
            }

            // 2. Hide Idle
            if (filters.value.hideIdle) {
                segments = segments.filter(s => s.kind !== 'IDLE');
            }

            // 3. Category Filter
            if (filters.value.categories.length > 0) {
                segments = segments.filter(s => filters.value.categories.includes(s.category));
            }

            // Legacy
            if (filterCategory.value) {
                segments = segments.filter(s => s.category === filterCategory.value);
            }

            return { ...day, segments };
        }).filter(day => day.segments.length > 0); // Optional: Hide empty days? Maybe keep them for context. Let's keep them for now or only show days with data.
        // Actually, if a day has 0 segments after filter, maybe hide it?
        // Let's allow empty days if they were loaded, but maybe users prefer seeing only activity.
        // I will keep the map but not filter out days for now, so the date header shows "No activity" or just empty space?
        // Let's filter out completely empty days for cleaner UI.
        // .filter(d => d.segments.length > 0);
    });

    const selectedSegment = computed(() => {
        if (!selectedSegmentId.value) return null;
        for (const day of timelineDays.value) {
            const found = day.segments.find(s => s.id === selectedSegmentId.value);
            if (found) return found;
        }
        return null;
    });

    async function loadTimeline() {
        isLoading.value = true;
        try {
            // Load last 7 days from currentDate
            const end = new Date(currentDate.value);
            const start = new Date(end);
            start.setDate(start.getDate() - 7);

            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];

            timelineDays.value = await api.getTimelineRange(startStr, endStr);
            // Reverse to show Today at bottom/top? 
            // Usually usually we want Today at the bottom if scrolling down, or Top if scrolling up.
            // Let's sort DESCENDING (Today first) if we want "Twitter style" or ASCENDING if "Calendar style".
            // The request says "hiển thị cả những hoạt động của hôm trước và thời gian trước".
            // If I render them in a vertical list, it makes sense to have Today at the top? Or Today at bottom (like chat)?
            // I'll stick to ASCENDING (oldest to newest) so you scroll down to see present.
            // But usually convenient to see Today immediately.
            // I will return ASCENDING, and the UI can scroll to bottom on load.
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    }

    function setDate(date: string) {
        currentDate.value = date;
        loadTimeline();
    }

    function setZoom(level: '6h' | '12h' | '24h') {
        zoomLevel.value = level;
    }

    function selectSegment(id: string | null) {
        selectedSegmentId.value = id;
    }

    function setCategoryFilter(cat: string | null) {
        filterCategory.value = cat;
    }

    return {
        currentDate,
        timelineDays,
        isLoading,
        // UI
        zoomLevel,
        selectedSegmentId,
        filterCategory,
        searchQuery,
        filters,
        filteredTimelineDays,
        selectedSegment,
        // Actions
        loadTimeline,
        setDate,
        setZoom,
        selectSegment,
        setCategoryFilter
    };
});
