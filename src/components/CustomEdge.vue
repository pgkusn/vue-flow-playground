<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import {
  getSmoothStepPath,
  getStraightPath,
  EdgeLabelRenderer,
  BaseEdge,
  useVueFlow,
  type EdgeProps,
} from '@vue-flow/core'
import { Delete } from '@element-plus/icons-vue'
import type { JourneyEdgeData } from '../composables/useJourneyData'

const props = defineProps<EdgeProps<JourneyEdgeData>>()

const { removeEdges } = useVueFlow()

/** data.straight 為 true（如動作↔判斷節點）時改用直線，否則用平滑階梯線 */
const pathData = computed(() =>
  props.data?.straight
    ? getStraightPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        targetX: props.targetX,
        targetY: props.targetY,
      })
    : getSmoothStepPath({
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

const stroke = computed(() => (props.style as CSSProperties | undefined)?.stroke ?? '#909399')

/** 連線樣式：沿用 edge 自帶顏色並加粗線寬（取自設計稿 4px 線條） */
const edgeStyle = computed<CSSProperties>(() => ({ ...(props.style as CSSProperties), stroke: stroke.value, strokeWidth: 2.5 }))

/** Yes/No 標籤配色（取自設計稿 edge-caption：淺色底 + 粗體字） */
const labelColor = computed(() => (props.label === 'Yes' ? '#439e28' : props.label === 'No' ? '#303133' : stroke.value))
const labelBg = computed(() => (props.label === 'Yes' ? '#f5f9f3' : props.label === 'No' ? '#fef2f2' : '#ffffff'))

const handleDelete = () => {
  removeEdges(props.id)
}
</script>

<template>
  <BaseEdge
    :id="id"
    :path="edgePath"
    :style="edgeStyle"
    :class="{ 'vue-flow__edge-path--animated': animated }"
  />

  <!-- 透明加粗的 hit-area：擴大滑鼠感應區，使 hover 線段任一處皆觸發 .vue-flow__edge:hover -->
  <path
    :d="edgePath"
    fill="none"
    stroke="transparent"
    stroke-width="20"
    style="cursor: pointer"
  />

  <!-- 刪除按鈕：放在 edge <g> 內（非 EdgeLabelRenderer），與 hit-area 同子樹，
       顯示／隱藏交由全域 CSS 依 .vue-flow__edge:hover / .selected 控制（純 CSS、無閃爍） -->
  <foreignObject
    :x="labelX - 16"
    :y="labelY - 16"
    width="32"
    height="32"
    style="overflow: visible"
  >
    <div class="flex h-8 w-8 items-center justify-center">
      <button
        class="edge-delete-btn group flex h-5 w-5 items-center justify-center rounded-full bg-white p-0 text-[#303133] shadow-sm transition-all duration-150 hover:h-6 hover:w-6 hover:bg-[#fee2e2]"
        title="刪除連線"
        @click.stop="handleDelete"
      >
        <Delete class="h-3 w-3 transition-all duration-150 group-hover:h-3.5 group-hover:w-3.5" />
      </button>
    </div>
  </foreignObject>

  <EdgeLabelRenderer>
    <!-- Yes / No 分支標籤 -->
    <div
      v-if="label"
      class="pointer-events-none absolute rounded-sm px-1 py-1 text-[10px] font-bold whitespace-nowrap"
      :style="{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
        color: labelColor,
        background: labelBg,
      }"
    >
      {{ label }}
    </div>
  </EdgeLabelRenderer>
</template>
