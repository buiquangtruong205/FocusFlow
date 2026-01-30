<script setup lang="ts">
import { ref } from 'vue';
import { Plus, CheckCircle2, Circle, Clock, CalendarDays, MoreHorizontal } from 'lucide-vue-next';

interface Task {
    id: number;
    title: string;
    estimatedTime: string;
    completed: boolean;
    tag: 'WORK' | 'COMM' | 'ENT' | 'OTHER';
}

const tasks = ref<Task[]>([
    { id: 1, title: 'Morning Review', estimatedTime: '30m', completed: true, tag: 'WORK' },
    { id: 2, title: 'Implement Timeline Tab', estimatedTime: '2h', completed: false, tag: 'WORK' },
    { id: 3, title: 'Team Sync', estimatedTime: '45m', completed: false, tag: 'COMM' },
]);

const newTask = ref('');

function addTask() {
    if (!newTask.value.trim()) return;
    tasks.value.push({
        id: Date.now(),
        title: newTask.value,
        estimatedTime: '30m',
        completed: false,
        tag: 'WORK'
    });
    newTask.value = '';
}
</script>

<template>
  <div class="p-8 h-full flex flex-col max-w-5xl mx-auto">
    <header class="mb-8 flex items-end justify-between">
      <div>
        <h2 class="text-3xl font-bold text-white mb-2">Daily Plan</h2>
        <p class="text-slate-400">Design your day intentionally.</p>
      </div>
      <div class="flex items-center gap-2 bg-surface p-1 rounded-lg border border-white/5">
         <button class="px-3 py-1.5 rounded-md bg-white/10 text-white text-sm font-medium shadow-sm">Today</button>
         <button class="px-3 py-1.5 rounded-md text-slate-400 hover:text-white text-sm transition-colors">Tomorrow</button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex gap-8 h-full min-h-0">
        <!-- Task List -->
        <div class="flex-1 flex flex-col bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <!-- Add Task Input -->
            <div class="p-4 border-b border-white/5 flex items-center gap-3">
                <Plus class="w-5 h-5 text-slate-500" />
                <input 
                    v-model="newTask"
                    @keydown.enter="addTask"
                    type="text" 
                    placeholder="Add a new task..." 
                    class="bg-transparent border-none outline-none text-white placeholder:text-slate-600 w-full"
                >
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-2">
                <div v-for="task in tasks" :key="task.id" class="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <button @click="task.completed = !task.completed" class="text-slate-500 hover:text-primary transition-colors">
                        <CheckCircle2 v-if="task.completed" class="w-5 h-5 text-emerald-400" />
                        <Circle v-else class="w-5 h-5" />
                    </button>
                    
                    <div class="flex-1" :class="{ 'opacity-50 line-through': task.completed }">
                        <div class="text-slate-200 font-medium">{{ task.title }}</div>
                    </div>
                    
                    <!-- Metadata -->
                    <div class="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div class="flex items-center gap-1 text-xs text-slate-400 bg-black/20 px-2 py-1 rounded">
                            <Clock class="w-3 h-3" />
                            {{ task.estimatedTime }}
                        </div>
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-300 border border-white/10">
                            {{ task.tag }}
                        </span>
                        <button class="text-slate-500 hover:text-white">
                            <MoreHorizontal class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar / Calendar Preview -->
        <div class="w-80 hidden lg:flex flex-col gap-6">
            <div class="bg-surface rounded-2xl p-6 border border-white/5">
                <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                    <CalendarDays class="w-4 h-4 text-primary" /> Schedule
                </h3>
                <!-- Mock Schedule -->
                <div class="space-y-4 relative">
                    <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10"></div>
                    
                    <div class="relative pl-6">
                        <div class="w-3 h-3 rounded-full bg-primary absolute left-0 top-1.5 border-2 border-surface"></div>
                        <div class="text-xs text-primary font-bold mb-1">09:00 AM</div>
                        <div class="text-sm text-white bg-white/5 p-2 rounded-lg border border-white/5">Morning Review</div>
                    </div>
                     <div class="relative pl-6">
                        <div class="w-3 h-3 rounded-full bg-slate-600 absolute left-0 top-1.5 border-2 border-surface"></div>
                        <div class="text-xs text-slate-500 mb-1">10:00 AM</div>
                         <div class="text-sm text-slate-400">Deep work block</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
