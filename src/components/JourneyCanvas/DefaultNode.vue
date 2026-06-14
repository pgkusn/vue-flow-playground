<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Flag, Pointer, Clock, Setting, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { JourneyNodeData } from '@/composables/useJourneyData'

const props = defineProps<{
  id: string
  data: JourneyNodeData
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: JourneyNodeData }): void
  (e: 'copy', id: string): void
  (e: 'delete', id: string): void
}>()

/** 各類型的 icon 與 icon 方塊底色（取自設計稿 element-plus icon） */
const TYPE_STYLE: Record<string, { icon: Component; bg: string }> = {
  entry: { icon: Flag, bg: '#0ea5e9' },
  action: { icon: Pointer, bg: '#3b82f6' },
  wait: { icon: Clock, bg: '#f59e0b' },
  end: { icon: Flag, bg: '#9ca3af' },
}

const style = computed(() => TYPE_STYLE[props.data.type] ?? TYPE_STYLE.action)

/** 連線點（handle）：8px 深灰圓點、白邊（取自設計稿 dot-s / dot-e） */
const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#4b5563',
  border: '1px solid #ffffff',
}
</script>

<template>
  <div
    class="group relative w-40 rounded-lg border border-[#d4d7de] bg-white shadow-sm transition hover:border-[#3b82f6] hover:shadow-md"
  >
    <!-- hover 動作列：bottom-full 緊貼卡片上緣，pb-2 為透明橋接區，使 hover 命中區連續不中斷 -->
    <div
      class="pointer-events-none absolute right-0 bottom-full flex gap-1.5 pb-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
    >
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#606266] shadow-md transition hover:bg-[#f8fafc]"
        title="設定"
        @click.stop="emit('edit', { id, label: data.title, data })"
      >
        <Setting class="h-3.5 w-3.5" />
      </button>
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#606266] shadow-md transition hover:bg-[#f8fafc]"
        title="複製"
        @click.stop="emit('copy', id)"
      >
        <CopyDocument class="h-3.5 w-3.5" />
      </button>
      <button
        class="flex h-6 w-6 items-center justify-center rounded bg-white text-[#606266] shadow-md transition hover:bg-[#f8fafc]"
        title="刪除"
        @click.stop="emit('delete', id)"
      >
        <Delete class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- 輸入 Handle：起點無 -->
    <Handle
      v-if="data.type !== 'entry'"
      type="target"
      :position="Position.Left"
      :style="handleStyle"
    />

    <div class="flex items-center gap-1.5 p-3">
      <div
        class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
        :style="{ background: style.bg }"
      >
        <component :is="style.icon" class="h-3.5 w-3.5 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm leading-normal text-[#303133]">{{ data.title }}</div>
        <div
          v-if="data.type !== 'end'"
          class="mt-1 truncate text-xs leading-none text-[#909399]"
          :title="data.description"
        >
          {{ data.description }}
        </div>
      </div>
    </div>

    <!-- 輸出 Handle：結束無 -->
    <Handle
      v-if="data.type !== 'end'"
      type="source"
      :position="Position.Right"
      :style="handleStyle"
    />
  </div>
</template>
