import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import type { FocusSessionDTO, FocusSessionConfig } from '../../shared/types';

export const useFocusStore = defineStore('focus', () => {
    // Session State
    const currentSession = ref<FocusSessionDTO | null>(null);
    const sessionState = ref<'SETUP' | 'RUNNING' | 'PAUSED' | 'COMPLETED'>('SETUP');

    // Timer State
    const durationMinutes = ref(25);
    const timeLeft = ref(25 * 60); // Seconds
    const timerInterval = ref<NodeJS.Timeout | null>(null);

    const taskTitle = ref('');

    // Setup Helpers
    function setDuration(min: number) {
        durationMinutes.value = min;
        if (sessionState.value === 'SETUP') {
            timeLeft.value = min * 60;
        }
    }

    // Actions
    async function startSession() {
        if (!taskTitle.value.trim()) return;

        const config: FocusSessionConfig = {
            durationMinutes: durationMinutes.value,
            taskTitle: taskTitle.value,
            allowedCategories: ['WORK'], // Default
            strictMode: false
        };

        // Ensure timeLeft matches durationMinutes (fix for custom input)
        timeLeft.value = durationMinutes.value * 60;

        try {
            // Request notification permission
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            const session = await api.startFocusSession(config);
            currentSession.value = session;
            sessionState.value = 'RUNNING';

            // Start Local Timer
            startTimer();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    function startTimer() {
        if (timerInterval.value) clearInterval(timerInterval.value);

        timerInterval.value = setInterval(() => {
            if (timeLeft.value > 0) {
                timeLeft.value--;
            } else {
                completeSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (timerInterval.value) {
            clearInterval(timerInterval.value);
            timerInterval.value = null;
        }
        sessionState.value = 'PAUSED';
        // TODO: Call API to pause
    }

    function resumeTimer() {
        sessionState.value = 'RUNNING';
        startTimer();
        // TODO: Call API to resume
    }

    async function stopSession() {
        if (currentSession.value) {
            await api.endFocusSession(currentSession.value.sessionId);
        }
        reset();
    }

    // Notifications
    const notificationTimeouts = ref<NodeJS.Timeout[]>([]);

    function clearNotifications() {
        notificationTimeouts.value.forEach(timeout => clearTimeout(timeout));
        notificationTimeouts.value = [];
    }

    async function completeSession() {
        if (timerInterval.value) clearInterval(timerInterval.value);
        if (currentSession.value) {
            await api.endFocusSession(currentSession.value.sessionId);
        }
        sessionState.value = 'COMPLETED';

        // Send 5 notifications, 10 seconds apart
        clearNotifications(); // Clear any existing
        for (let i = 0; i < 5; i++) {
            const timeout = setTimeout(() => {
                new Notification('Focus Flow', {
                    body: 'Focus session completed! Time to take a break.',
                    icon: '/logo.png' // Assuming logo is available
                });
            }, i * 10000); // 0s, 10s, 20s, 30s, 40s
            notificationTimeouts.value.push(timeout);
        }
    }

    function reset() {
        if (timerInterval.value) clearInterval(timerInterval.value);
        timerInterval.value = null;
        clearNotifications(); // Stop notifications if user resets
        sessionState.value = 'SETUP';
        timeLeft.value = durationMinutes.value * 60;
        currentSession.value = null;
    }

    // Formatters
    const formattedTime = computed(() => {
        const m = Math.floor(timeLeft.value / 60);
        const s = timeLeft.value % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    });

    const progress = computed(() => {
        const total = durationMinutes.value * 60;
        return ((total - timeLeft.value) / total) * 100;
    });

    return {
        sessionState,
        durationMinutes,
        timeLeft,
        taskTitle,
        currentSession,
        formattedTime,
        progress,
        setDuration,
        startSession,
        pauseTimer,
        resumeTimer,
        stopSession,
        reset
    };
});
