import { createRouter, createWebHashHistory } from 'vue-router'
import Today from '@/pages/Today.vue'
import Timeline from '@/pages/Timeline.vue'
import Focus from '@/pages/Focus.vue'
import Insights from '@/pages/Insights.vue'
import Advice from '@/pages/Advice.vue'
import Settings from '@/pages/Settings.vue'

const routes = [
    {
        path: '/',
        name: 'Today',
        component: Today
    },
    {
        path: '/timeline',
        name: 'Timeline',
        component: Timeline
    },
    {
        path: '/focus',
        name: 'Focus',
        component: Focus
    },
    {
        path: '/insights',
        name: 'Insights',
        component: Insights
    },
    {
        path: '/advice',
        name: 'Advice',
        component: Advice
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings
    }
]

const router = createRouter({
    // Use Hash History for Electron to avoid routing issues with file:// protocol
    history: createWebHashHistory(),
    routes
})

export default router