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
      <span class="custom-node__icon">{{ data.icon }}</span>
      <span>{{ data.title }}</span>
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
