import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import type { JourneyNodeType } from './useJourneyData'
import { nextNodeId } from './useNodeId'

/** 各可拖曳節點類型的預設內容 */
const typeConfig: Record<string, { title: string; description: string }> = {
  action: { title: '動作節點', description: '重點訊息' },
  condition: { title: '判斷節點', description: '重點訊息' },
  wait: { title: '等待節點', description: '重點訊息' },
  end: { title: '結束', description: '重點訊息' },
}

/**
 * useDnD — 封裝「從側邊欄拖曳節點到 Vue Flow 畫布」的完整邏輯。
 * - Sidebar：呼叫 onDragStart(event, nodeType) 啟動拖曳
 * - App（canvas wrapper）：綁定 onDragOver / onDrop
 */
export const useDnD = () => {
  const { addNodes, project, vueFlowRef } = useVueFlow()

  const isDragOver = ref(false)

  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const onDragLeave = () => {
    isDragOver.value = false
  }

  /**
   * 放下節點到畫布：依拖曳類型建立對應的 Vue Flow 節點。
   * @returns 新建立的節點，失敗回傳 null
   */
  const onDrop = (event: DragEvent): Node | null => {
    isDragOver.value = false
    if (!event.dataTransfer) return null

    const nodeType = event.dataTransfer.getData('application/vueflow') as JourneyNodeType
    if (!nodeType || !typeConfig[nodeType]) return null

    const { left, top } = vueFlowRef.value!.getBoundingClientRect()
    const position = project({
      x: event.clientX - left,
      y: event.clientY - top,
    })

    const config = typeConfig[nodeType]
    const newNode: Node = {
      id: nextNodeId(),
      type: nodeType === 'condition' ? 'condition' : 'default',
      position,
      data: {
        type: nodeType,
        title: config.title,
        description: config.description,
        raw: {},
      },
    }

    addNodes([newNode])
    return newNode
  }

  return {
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
