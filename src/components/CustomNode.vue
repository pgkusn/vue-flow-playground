<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface NodeData {
  category: 'input' | 'process' | 'output' | 'data'
  icon: string
  title: string
  description: string
  status: string
}

defineProps<{
  id: string
  data: NodeData
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: NodeData }): void
  (e: 'copy', id: string): void
  (e: 'delete', id: string): void
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
      <div style="display: flex; align-items: center; gap: 4px;">
        <!-- 編輯按鈕 -->
        <button 
          class="custom-node__edit-btn" 
          title="編輯節點"
          @click.stop="emit('edit', { id, label: data.title, data })"
        >
          ⚙️
        </button>
        <!-- 複製按鈕 -->
        <button 
          class="custom-node__edit-btn" 
          title="複製節點"
          @click.stop="emit('copy', id)"
        >
          📋
        </button>
        <!-- 刪除按鈕 -->
        <button 
          class="custom-node__edit-btn custom-node__edit-btn--danger" 
          title="刪除節點"
          @click.stop="emit('delete', id)"
        >
          🗑️
        </button>
      </div>
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
