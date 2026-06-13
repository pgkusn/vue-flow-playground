<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node, Edge, Connection } from '@vue-flow/core'
import type { JourneyNodeData } from '../composables/useJourneyData'

import JourneyNode from './JourneyNode.vue'
import ConditionNode from './ConditionNode.vue'
import CustomEdge from './CustomEdge.vue'
import { useDnD } from '../composables/useDnD'

defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  (e: 'edit', payload: { id: string; label: string; data: JourneyNodeData }): void
  (e: 'copy', id: string): void
  (e: 'delete', id: string): void
}>()

const { onConnect, addEdges } = useVueFlow()

const { isDragOver, onDragOver, onDragLeave, onDrop } = useDnD()

/**
 * 當使用者連接兩個節點時自動建立一條動畫邊。
 * 來源為判斷節點的 yes/no Handle 時，套用 Yes(綠)/No(紅) 樣式，其餘為灰色 default。
 */
onConnect((connection: Connection) => {
  const handleId = connection.sourceHandle

  const branchConfig: Record<string, { label: string; stroke: string }> = {
    yes: { label: 'Yes', stroke: '#439e28' },
    no: { label: 'No', stroke: '#f43f5e' },
  }
  const branch = handleId ? branchConfig[handleId] : null
  const stroke = branch ? branch.stroke : '#909399'

  addEdges([
    {
      ...connection,
      type: 'deletable',
      animated: true,
      ...(branch ? { label: branch.label } : {}),
      style: { stroke },
    },
  ])
})
</script>

<template>
  <div
    class="journey-canvas relative flex-1 overflow-hidden transition-shadow duration-200"
    :class="{ 'shadow-[inset_0_0_0_2px_rgba(129,140,248,0.4)]': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <VueFlow
      :nodes
      :edges
      :min-zoom="0.2"
      :max-zoom="4"
      fit-view-on-init
      :default-edge-options="{ type: 'deletable' }"
    >
      <!-- 一般旅程節點（entry / wait / action / end） -->
      <template #node-journey="nodeProps">
        <JourneyNode
          v-bind="nodeProps"
          @edit="emit('edit', $event)"
          @copy="emit('copy', $event)"
          @delete="emit('delete', $event)"
        />
      </template>

      <!-- 條件分支節點 -->
      <template #node-condition="nodeProps">
        <ConditionNode
          v-bind="nodeProps"
          @edit="emit('edit', $event)"
          @copy="emit('copy', $event)"
          @delete="emit('delete', $event)"
        />
      </template>

      <!-- 使用動態作用域插槽 #edge-<type> 來渲染自定義 Edge -->
      <template #edge-deletable="edgeProps">
        <CustomEdge v-bind="edgeProps" />
      </template>

      <Background :gap="20" :size="1" pattern-color="#cbd5e1" />

      <!-- 控制按鈕 -->
      <Controls />

      <!-- 小地圖 -->
      <MiniMap pannable zoomable />
    </VueFlow>
  </div>
</template>

<!--
  非 scoped：Vue Flow 為第三方產生的 DOM，覆寫需作用於全域選擇器並使用 !important。
  本區塊隨元件檔案移動，移植時無需另尋全域樣式。
-->
<style>
/* 元件自帶的設計變數（複製自全域 :root），透過繼承供內部 .vue-flow__* DOM 使用，
   使本元件不相依全域 :root 即可獨立移植 */
.journey-canvas {
  --font-sans: 'DM Sans', system-ui, -apple-system, sans-serif;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --accent-violet: #a78bfa;
  --accent-emerald: #34d399;
}

/* Canvas background（取自設計稿畫布底色） */
.journey-canvas .vue-flow {
  background: #f2f3f5 !important;
}

/* 節點外層容器交給自訂卡片元件呈現邊框/陰影，這裡保持中性 */
.journey-canvas .vue-flow__node {
  font-family: var(--font-sans) !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.journey-canvas .vue-flow__node.selected {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.45) !important;
  border-radius: 8px;
}

/* Handles：8px 深灰圓點、白邊（取自設計稿 dot-s / dot-e）；
   不使用 !important，讓判斷節點 yes/no 的 inline 綠/紅可覆蓋 */
.journey-canvas .vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #4b5563;
  border: 1px solid #ffffff;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.journey-canvas .vue-flow__handle-left:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.journey-canvas .vue-flow__handle-right:hover {
  transform: translate(50%, -50%) scale(1.2);
}

.journey-canvas .vue-flow__handle-top:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.journey-canvas .vue-flow__handle-bottom:hover {
  transform: translate(-50%, 50%) scale(1.2);
}

/* Edges：實際顏色/線寬由 CustomEdge 以 inline style 提供，此為後備值 */
.journey-canvas .vue-flow__edge-path {
  stroke: #909399;
  stroke-width: 2;
}

.journey-canvas .vue-flow__edge.selected .vue-flow__edge-path {
  stroke: var(--accent-violet) !important;
  stroke-width: 3 !important;
}

.journey-canvas .vue-flow__edge.animated .vue-flow__edge-path {
  stroke-dasharray: 5 !important;
  animation: dashdraw 0.5s linear infinite !important;
}

@keyframes dashdraw {
  to {
    stroke-dashoffset: -10;
  }
}

/* 刪除連線按鈕：純 CSS hover，按鈕與 hit-area 同在 edge <g> 子樹，hover/selected 時才顯示 */
.journey-canvas .edge-delete-btn {
  opacity: 0;
  transform: scale(0.5);
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.journey-canvas .vue-flow__edge:hover .edge-delete-btn,
.journey-canvas .vue-flow__edge.selected .edge-delete-btn {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}

/* Connection line */
.journey-canvas .vue-flow__connection-path {
  stroke: var(--accent-emerald) !important;
  stroke-width: 2 !important;
  stroke-dasharray: 5;
}

/* Minimap overrides（取自設計稿 ScaleCanva：淺灰底、細邊、圓角 10） */
.journey-canvas .vue-flow__minimap {
  width: 180px !important;
  height: 140px !important;
  background: #f3f4f6 !important;
  border: 1px solid #d1d5db !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  bottom: 16px !important;
  right: 16px !important;
}

.journey-canvas .vue-flow__minimap-node {
  fill: #d1d5db !important;
  stroke: none !important;
}

.journey-canvas .vue-flow__minimap-mask {
  fill: rgba(255, 255, 255, 0.65) !important;
}

/* Controls overrides（取自設計稿 FunctionButton：垂直按鈕組、共用邊框分隔線） */
.journey-canvas .vue-flow__controls {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 6px !important;
  box-shadow: none !important;
  overflow: hidden;
  bottom: 16px !important;
  left: 16px !important;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.journey-canvas .vue-flow__controls-button {
  background: #ffffff !important;
  border: none !important;
  border-bottom: 1px solid #dcdfe6 !important;
  border-radius: 0 !important;
  color: #606266 !important;
  fill: #606266 !important;
  width: 24px !important;
  height: 24px !important;
  padding: 6px !important;
  transition: all var(--transition-fast) !important;
}

.journey-canvas .vue-flow__controls-button:last-child {
  border-bottom: none !important;
}

.journey-canvas .vue-flow__controls-button:hover {
  background: #f5f7fa !important;
  color: #303133 !important;
  fill: #303133 !important;
}

/* Background pattern */
.journey-canvas .vue-flow__background {
  opacity: 0.4;
}

/* Selection box */
.journey-canvas .vue-flow__selection {
  background: rgba(129, 140, 248, 0.08) !important;
  border: 1px solid rgba(129, 140, 248, 0.3) !important;
  border-radius: 4px !important;
}
</style>
