import { api } from './api';
import type { DailySummaryDTO, TopAppDTO } from '../../shared/types';

export const statsService = {
    async getDailySummary(date: string): Promise<DailySummaryDTO> {
        try {
            return await api.getDailySummary(date);
        } catch (error) {
            console.error('Failed to fetch daily summary:', error);
            throw error;
        }
    },

    async getTopApps(date: string, limit: number = 5): Promise<TopAppDTO[]> {
        try {
            return await api.getTopApps(date, limit);
        } catch (error) {
            console.error('Failed to fetch top apps:', error);
            return [];
        }
    },

    async getInsightsData(days: number = 7) {
        try {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - (days - 1));

            // Use local date strings to ensure we match the user's "today"
            const formatLocalYMD = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const startStr = formatLocalYMD(start);
            const endStr = formatLocalYMD(end);

            const stats = await api.getStatsRange(startStr, endStr);

            // Process for Weekly Activity Chart
            const weeklyData = stats.map(s => {

                // Actually, if s.date is "2023-10-27", new Date("2023-10-27") is UTC.
                // But we just want the day name.
                // To avoid timezone shift issues displaying the wrong day name:
                // Construct date using parts.
                const [y, m, day] = s.date.split('-').map(Number);
                const localDate = new Date(y, m - 1, day);
                const dayName = localDate.toLocaleDateString('en-US', { weekday: 'short' });

                const focusH = (s.byCategoryMs.WORK || 0) / 3600000;
                // Treat COMM, ENT, OTHER, UNCATEGORIZED as 'Distracted' / 'Non-Focus'
                // This ensures the visual bars represent total activity
                const distractedH = ((s.byCategoryMs.COMM || 0) +
                    (s.byCategoryMs.ENT || 0) +
                    (s.byCategoryMs.OTHER || 0) +
                    (s.byCategoryMs.UNCATEGORIZED || 0)) / 3600000;

                return {
                    day: dayName,
                    focus: parseFloat(focusH.toFixed(1)),
                    distracted: parseFloat(distractedH.toFixed(1))
                };
            });


            // Process for Category Split
            const totalMs = stats.reduce((acc, s) => acc + s.activeMs, 0);
            // Sum by category
            const catSums = { Work: 0, Comm: 0, Ent: 0, Other: 0 };
            stats.forEach(s => {
                catSums.Work += s.byCategoryMs.WORK || 0;
                catSums.Comm += s.byCategoryMs.COMM || 0;
                catSums.Ent += s.byCategoryMs.ENT || 0;
                catSums.Other += (s.byCategoryMs.OTHER || 0) + (s.byCategoryMs.UNCATEGORIZED || 0);
            });

            const distribution = [];
            if (totalMs > 0) {
                distribution.push({ label: 'Work', value: Math.round((catSums.Work / totalMs) * 100), color: 'bg-indigo-500' });
                distribution.push({ label: 'Comm', value: Math.round((catSums.Comm / totalMs) * 100), color: 'bg-pink-500' });
                distribution.push({ label: 'Ent', value: Math.round((catSums.Ent / totalMs) * 100), color: 'bg-violet-500' });
                distribution.push({ label: 'Other', value: Math.round((catSums.Other / totalMs) * 100), color: 'bg-slate-500' });
            } else {
                // Empty state defaults
                distribution.push({ label: 'Work', value: 0, color: 'bg-indigo-500' });
                distribution.push({ label: 'Comm', value: 0, color: 'bg-pink-500' });
                distribution.push({ label: 'Ent', value: 0, color: 'bg-violet-500' });
                distribution.push({ label: 'Other', value: 0, color: 'bg-slate-500' });
            }

            // Streak Calculation
            // Count consecutive days with activeMs > 10 mins working backwards from yesterday (or today)
            // For MVP, just count how many days in the range have activeMs > 0.
            // Real streak should look at database history beyond 7 days. 
            // But for now, let's just show "Active Days / 7" or similar, OR just random fake logic if we can't query history?
            // "Current Streak" implies contiguous.
            // Let's count contiguous non-zero activeMs days ending at today/yesterday from the 7 fetched days.
            let streak = 0;
            // Iterate backwards
            for (let i = stats.length - 1; i >= 0; i--) {
                if (stats[i].activeMs > 10 * 60 * 1000) { // arbitrary threshold 10 mins
                    streak++;
                } else {
                    // If today (last index) is 0, maybe don't break yet if it's early morning? 
                    // But if yesterday is 0, break.
                    if (i === stats.length - 1) continue; // Skip today check logic for now
                    break;
                }
            }

            // Productivity Score
            let productivityScore = 0;
            if (totalMs > 0) {
                productivityScore = Math.round((catSums.Work / totalMs) * 100);
            }

            return {
                weeklyData: weeklyData,
                distribution: distribution.sort((a, b) => b.value - a.value),
                streak,
                productivityScore
            };

        } catch (error) {
            console.error('Failed to fetch insights:', error);
            throw error;
        }
    }
};
