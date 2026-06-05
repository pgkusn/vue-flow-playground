<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useVueFlow,
  type EdgeProps,
} from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const { removeEdges } = useVueFlow()

/** Hover 狀態：透過 JS 偵測（CSS 跨 DOM 邊界無效） */
const isHovered = ref(false)

/** 計算 smoothstep 路徑與中點座標 */
const pathData = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 8,
  }),
)

const edgePath = computed(() => pathData.value[0])
const labelX = computed(() => pathData.value[1])
const labelY = computed(() => pathData.value[2])

function handleDelete() {
  removeEdges(props.id)
}
</script>

<template>
  <!-- 基本路徑 + 標籤 -->
  <BaseEdge
    :id="id"
    :path="edgePath"
    :marker-end="markerEnd"
    :style="style"
    :label="label"
    :label-x="labelX"
    :label-y="labelY"
    :label-style="{ fill: style?.stroke ?? '#9898b8', fontSize: '11px', fontWeight: 700 }"
    :label-show-bg="true"
    :label-bg-style="{ fill: '#0a0a0f', fillOpacity: 0.85 }"
    :label-bg-padding="[4, 8]"
    :label-bg-border-radius="8"
    :class="{ 'vue-flow__edge-path--animated': animated }"
  />

  <!--
    透明加粗的 hit-area path：擴大滑鼠感應區域
    並由這裡驅動 isHovered，再傳遞給 EdgeLabelRenderer 裡的按鈕。
    EdgeLabelRenderer 在不同的 DOM 層，無法靠 CSS :hover 跨層偵測。
  -->
  <path
    :d="edgePath"
    fill="none"
    stroke="transparent"
    stroke-width="20"
    style="cursor: pointer;"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  />

  <!-- 使用 EdgeLabelRenderer 在 DOM 層渲染標籤與刪除按鈕 -->
  <EdgeLabelRenderer>
    <div
      class="edge-label-wrap"
      :style="{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all',
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- 刪除按鈕 -->
      <button
        class="edge-delete-btn"
        :class="{ 'edge-delete-btn--visible': isHovered || selected }"
        title="刪除連線"
        @click.stop="handleDelete"
      >
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </button>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.edge-label-wrap {
  position: absolute;
}

.edge-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 100, 100, 0.7);
  background: rgba(20, 18, 30, 0.88);
  color: #ff6b6b;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transform: scale(0.65);
  transition:
    opacity 0.18s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.15s ease,
    border-color 0.15s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
}

/* 由 JS isHovered / selected 控制顯示 */
.edge-delete-btn--visible {
  opacity: 1;
  transform: scale(1);
}

.edge-delete-btn:hover {
  background: rgba(220, 40, 40, 0.92) !important;
  border-color: #ff4444 !important;
  color: #fff !important;
  transform: scale(1.18) !important;
}

.edge-delete-btn:active {
  transform: scale(0.92) !important;
}
</style>
