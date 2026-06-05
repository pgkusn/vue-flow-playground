<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface ConditionData {
  category: 'condition'
  icon: string
  title: string
  description: string
  status: string
  /** 條件表達式（顯示在節點上） */
  condition: string
}

defineProps<{
  id: string
  data: ConditionData
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: ConditionData }): void
  (e: 'copy', id: string): void
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <div class="condition-node">
    <!-- 輸入 Handle -->
    <Handle type="target" :position="Position.Left" class="condition-node__handle" />

    <!-- 菱形裝飾背景 -->
    <div class="condition-node__diamond">
      <svg viewBox="0 0 120 120" class="condition-node__diamond-svg">
        <polygon points="60,4 116,60 60,116 4,60" />
      </svg>
    </div>

    <!-- 節點內容 -->
    <div class="condition-node__content">
      <!-- 標題列 -->
      <div class="condition-node__header">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="condition-node__icon">{{ data.icon }}</span>
          <span class="condition-node__title">{{ data.title }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button
            class="condition-node__action-btn"
            title="編輯節點"
            @click.stop="emit('edit', { id, label: data.title, data })"
          >⚙️</button>
          <button
            class="condition-node__action-btn"
            title="複製節點"
            @click.stop="emit('copy', id)"
          >📋</button>
          <button
            class="condition-node__action-btn condition-node__action-btn--danger"
            title="刪除節點"
            @click.stop="emit('delete', id)"
          >🗑️</button>
        </div>
      </div>

      <!-- 條件表達式 -->
      <div class="condition-node__condition">
        <span class="condition-node__condition-label">IF</span>
        <code class="condition-node__condition-expr">{{ data.condition || data.description }}</code>
      </div>

      <!-- 分支標籤 -->
      <div class="condition-node__branches">
        <div class="condition-node__branch condition-node__branch--yes">
          <span class="condition-node__branch-dot condition-node__branch-dot--yes"></span>
          Yes / True
        </div>
        <div class="condition-node__branch condition-node__branch--no">
          <span class="condition-node__branch-dot condition-node__branch-dot--no"></span>
          No / False
        </div>
      </div>

      <!-- 底部狀態 -->
      <div class="condition-node__footer">
        <div class="condition-node__status">
          <span class="custom-node__status-dot"></span>
          {{ data.status }}
        </div>
        <span style="font-size: 10px; color: var(--text-muted);">ID: {{ id }}</span>
      </div>
    </div>

    <!-- 輸出 Handle: Yes 分支 (右上) -->
    <Handle
      id="yes"
      type="source"
      :position="Position.Right"
      :style="{ top: '35%' }"
      class="condition-node__handle condition-node__handle--yes"
    />
    <span class="condition-node__handle-label condition-node__handle-label--yes">Yes</span>

    <!-- 輸出 Handle: No 分支 (右下) -->
    <Handle
      id="no"
      type="source"
      :position="Position.Right"
      :style="{ top: '65%' }"
      class="condition-node__handle condition-node__handle--no"
    />
    <span class="condition-node__handle-label condition-node__handle-label--no">No</span>
  </div>
</template>
