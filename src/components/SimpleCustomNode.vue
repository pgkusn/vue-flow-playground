<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

// 定義 Props，接收 Vue Flow 傳遞的節點資料
defineProps<{
  id: string
  data: {
    emoji: string
    title: string
    description: string
  }
}>()
</script>

<template>
  <div class="simple-custom-node">
    <!-- 輸入連接點 (上方) -->
    <Handle type="target" :position="Position.Top" class="custom-handle custom-handle--top" />

    <!-- 節點內容 -->
    <div class="node-content">
      <span class="node-emoji">{{ data.emoji || '📦' }}</span>
      <div class="node-details">
        <h4 class="node-title">{{ data.title }}</h4>
        <p class="node-desc">{{ data.description }}</p>
      </div>
    </div>

    <!-- 輸出連接點 (下方) -->
    <Handle type="source" :position="Position.Bottom" class="custom-handle custom-handle--bottom" />
  </div>
</template>

<style scoped>
.simple-custom-node {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 180px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease;
}

/* 懸停時的精緻發光邊框 */
.simple-custom-node:hover {
  border-color: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

.node-content {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.node-emoji {
  font-size: 1.5rem;
}

.node-details {
  display: flex;
  flex-direction: column;
}

.node-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.node-desc {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 2px 0 0 0;
}

/* 自訂連接點樣式 */
.custom-handle {
  width: 8px !important;
  height: 8px !important;
  background: #0f172a !important;
  border: 2px solid #10b981 !important;
  border-radius: 50% !important;
}

.custom-handle--top {
  top: -4px !important;
}

.custom-handle--bottom {
  bottom: -4px !important;
}
</style>
