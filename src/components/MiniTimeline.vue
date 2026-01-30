<script setup lang="ts">
// MVP: Visual representation of "Chunks" of the day
// For detailed data, we would need the TimelineDTO passed down
</script>

<template>
  <div class="bg-surface rounded-2xl p-6 border border-white/5">
     <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-white text-lg">Day at a Glance</h3>
        <span class="text-xs text-slate-500 uppercase tracking-wider">Mini Timeline</span>
     </div>
     
     <div class="relative h-12 w-full bg-white/5 rounded-xl overflow-hidden flex">
        <!-- Mock visual blocks for MVP -->
        
        <!-- 9:00 - 11:00 Focus -->
        <div class="h-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center border-r border-background" style="width: 25%">
            <span class="text-xs font-medium text-primary">Focus</span>
        </div>
        
        <!-- 11:00 - 12:00 Comm/Distracted -->
        <div class="h-full bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center border-r border-background" style="width: 15%">
            <span class="text-xs font-medium text-rose-400">Distracted</span>
        </div>

         <!-- 12:00 - 13:00 Lunch/Idle -->
        <div class="h-full bg-slate-700/30 flex items-center justify-center border-r border-background" style="width: 10%">
             <span class="text-xs text-slate-500">Idle</span>
        </div>

         <!-- 13:00 - 15:00 Focus -->
        <div class="h-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center border-r border-background" style="width: 30%">
             <span class="text-xs font-medium text-primary">Focus</span>
        </div>

        <!-- Remaining -->
        <div class="h-full bg-transparent" style="width: 20%"></div>
     </div>
     
     <div class="flex justify-between text-xs text-slate-500 mt-2 font-mono">
        <span>09:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>18:00</span>
     </div>
  </div>
</template>
