<script setup lang="ts">
import type { Component } from 'vue'
import { Pointer, Share, Clock, Flag } from '@element-plus/icons-vue'
import { useDnD } from '../composables/useDnD'

const { onDragStart } = useDnD()

/** 可拖曳的節點類型（起點固定於畫布，不在此列出），icon／配色取自設計稿 */
const nodeTypes: { type: string; icon: Component; name: string; bg: string }[] = [
  { type: 'action', icon: Pointer, name: '動作節點', bg: '#3b82f6' },
  { type: 'condition', icon: Share, name: '判斷節點', bg: '#dc2626' },
  { type: 'wait', icon: Clock, name: '等待節點', bg: '#f59e0b' },
  { type: 'end', icon: Flag, name: '結束', bg: '#9ca3af' },
]
</script>

<template>
  <aside
    class="flex w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r border-[#dcdfe6] bg-white p-5"
  >
    <div
      v-for="node in nodeTypes"
      :key="node.type"
      class="flex cursor-grab items-center justify-between gap-1.5 rounded-lg border border-[#d4d7de] bg-white p-3 transition select-none hover:border-[#3b82f6] hover:shadow-sm active:scale-[0.98]"
      :draggable="true"
      @dragstart="onDragStart($event, node.type)"
    >
      <div class="flex items-center gap-1.5">
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
          :style="{ background: node.bg }"
        >
          <component :is="node.icon" class="h-3.5 w-3.5 text-white" />
        </div>
        <div class="text-sm text-[#303133]">{{ node.name }}</div>
      </div>
      <!-- 拖曳把手（取自設計稿 2×3 點陣） -->
      <svg class="h-3.5 w-2 shrink-0" viewBox="0 0 8 14" fill="#909399" aria-hidden="true">
        <rect x="0.5" y="1.5" width="2.5" height="2.5" rx="0.8" />
        <rect x="5" y="1.5" width="2.5" height="2.5" rx="0.8" />
        <rect x="0.5" y="5.75" width="2.5" height="2.5" rx="0.8" />
        <rect x="5" y="5.75" width="2.5" height="2.5" rx="0.8" />
        <rect x="0.5" y="10" width="2.5" height="2.5" rx="0.8" />
        <rect x="5" y="10" width="2.5" height="2.5" rx="0.8" />
      </svg>
    </div>
  </aside>
</template>
