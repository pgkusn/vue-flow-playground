<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface NodeData {
  category: 'input' | 'process' | 'output' | 'data'
  icon: string
  title: string
  description: string
  status: string
}

const props = defineProps<{
  id: string
  data: NodeData
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: NodeData }): void
}>()
</script>

<template>
  <div class="custom-node">
    <!-- 輸入 Handle -->
    <Handle
      v-if="data.category !== 'input'"
      type="target"
      :position="Position.Left"
    />

    <!-- 節點標題列 -->
    <div :class="['custom-node__header', `custom-node__header--${data.category}`]">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="custom-node__icon">{{ data.icon }}</span>
        <span>{{ data.title }}</span>
      </div>
      <!-- 編輯按鈕：加了 .stop 阻止點擊事件向外擴散而觸發畫布選取 -->
      <button 
        class="custom-node__edit-btn" 
        title="編輯節點設定"
        @click.stop="emit('edit', { id, label: data.title, data })"
      >
        ⚙️
      </button>
    </div>

    <!-- 節點內容 -->
    <div class="custom-node__body">
      <div class="custom-node__label">描述</div>
      <div class="custom-node__value">{{ data.description }}</div>
    </div>

    <!-- 節點底部狀態 -->
    <div class="custom-node__footer">
      <div class="custom-node__status">
        <span class="custom-node__status-dot"></span>
        {{ data.status }}
      </div>
      <span style="font-size: 10px; color: var(--text-muted);">ID: {{ id }}</span>
    </div>

    <!-- 輸出 Handle -->
    <Handle
      v-if="data.category !== 'output'"
      type="source"
      :position="Position.Right"
    />
  </div>
</template>
