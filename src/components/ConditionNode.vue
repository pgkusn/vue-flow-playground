<script setup lang="ts">
import type { JourneyNodeData } from '../composables/useJourneyData'
import { Handle, Position } from '@vue-flow/core'
import { Share, Setting, CopyDocument, Delete } from '@element-plus/icons-vue'

defineProps<{
  id: string
  data: JourneyNodeData
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: JourneyNodeData }): void
  (e: 'copy', id: string): void
  (e: 'delete', id: string): void
}>()

/** 連線點：8px 圓點、白邊（取自設計稿 dot-s / Dots） */
const targetHandleStyle = { width: '8px', height: '8px', background: '#4b5563', border: '1px solid #ffffff' }
const yesHandleStyle = { top: '32%', width: '8px', height: '8px', background: '#439e28', border: '1px solid #ffffff' }
const noHandleStyle = { top: '68%', width: '8px', height: '8px', background: '#ef4444', border: '1px solid #ffffff' }
</script>

<template>
  <div class="group relative w-40 rounded-lg border border-[#d4d7de] bg-white shadow-sm transition hover:border-[#dc2626] hover:shadow-md">
    <!-- hover 動作列：bottom-full 緊貼卡片上緣，pb-2 為透明橋接區，使 hover 命中區連續不中斷 -->
    <div
      class="pointer-events-none absolute right-0 bottom-full flex gap-1.5 pb-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
    >
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#606266] shadow-md transition hover:bg-slate-50"
        title="設定"
        @click.stop="emit('edit', { id, label: data.title, data })"
      >
        <Setting class="h-3.5 w-3.5" />
      </button>
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#606266] shadow-md transition hover:bg-slate-50"
        title="複製"
        @click.stop="emit('copy', id)"
      >
        <CopyDocument class="h-3.5 w-3.5" />
      </button>
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#f56c6c] shadow-md transition hover:bg-red-50"
        title="刪除"
        @click.stop="emit('delete', id)"
      >
        <Delete class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- 輸入 Handle -->
    <Handle type="target" :position="Position.Left" :style="targetHandleStyle" />

    <div class="flex items-center gap-1.5 p-3">
      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#dc2626]">
        <Share class="h-3.5 w-3.5 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm leading-normal text-[#303133]">{{ data.title }}</div>
        <div class="mt-1 truncate text-xs leading-none text-[#909399]" :title="data.description">
          {{ data.description }}
        </div>
      </div>
    </div>

    <!-- 輸出 Handle：Yes（綠，上）對應 branch 0 -->
    <Handle id="yes" type="source" :position="Position.Right" :style="yesHandleStyle" />
    <!-- 輸出 Handle：No（紅，下）對應 branch else -->
    <Handle id="no" type="source" :position="Position.Right" :style="noHandleStyle" />
  </div>
</template>
