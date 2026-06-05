import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'

/**
 * 節點類型預設配置
 */
const categoryConfig: Record<
  string,
  { icon: string; title: string; description: string }
> = {
  input:     { icon: '📥', title: '新輸入節點',   description: '設定資料來源' },
  process:   { icon: '⚙️', title: '新處理節點',   description: '資料處理邏輯' },
  output:    { icon: '📤', title: '新輸出節點',   description: '輸出目的地'   },
  data:      { icon: '💾', title: '新資料節點',   description: '資料儲存'     },
  condition: { icon: '🔀', title: '新條件節點',   description: '條件判斷'     },
}

/**
 * useDnD — 封裝「從側邊欄拖曳節點到 Vue Flow 畫布」的完整邏輯
 *
 * 使用方式：
 * - Sidebar：呼叫 onDragStart(event, nodeType) 啟動拖曳
 * - App (canvas wrapper)：綁定 @dragover="onDragOver" @drop="onDrop"
 *
 * 內部透過 HTML5 DataTransfer 傳遞節點類型，
 * 並使用 Vue Flow 的 project() 將螢幕座標轉為畫布座標。
 */
export function useDnD() {
  const { addNodes, project, vueFlowRef } = useVueFlow()

  /** 目前正在拖曳的節點類型 (用於視覺回饋) */
  const isDragOver = ref(false)

  /** 節點 ID 計數器 */
  let nodeId = 100

  /**
   * 拖曳開始 — 在 Sidebar 中呼叫
   * 將節點類型寫入 dataTransfer
   */
  function onDragStart(event: DragEvent, nodeType: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  /**
   * 拖曳經過畫布上方 — 綁定到 canvas wrapper
   */
  function onDragOver(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = true
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  /**
   * 拖曳離開畫布
   */
  function onDragLeave() {
    isDragOver.value = false
  }

  /**
   * 放下節點到畫布 — 綁定到 canvas wrapper
   * 從 dataTransfer 取得節點類型，轉換座標後建立節點
   * @returns 新建立的節點（供外部顯示通知等用途），若失敗則回傳 null
   */
  function onDrop(event: DragEvent): Node | null {
    isDragOver.value = false

    if (!event.dataTransfer) return null

    const nodeType = event.dataTransfer.getData('application/vueflow')
    if (!nodeType) return null

    // 螢幕座標 → 畫布座標
    const { left, top } = vueFlowRef.value!.getBoundingClientRect()
    const position = project({
      x: event.clientX - left,
      y: event.clientY - top,
    })

    const id = `node-${++nodeId}`
    const config = categoryConfig[nodeType] || categoryConfig.process

    const newNode: Node = {
      id,
      type: nodeType === 'condition' ? 'condition' : 'custom',
      position,
      data: {
        category: nodeType,
        icon: config.icon,
        title: config.title,
        description: config.description,
        status: '新建立',
        ...(nodeType === 'condition' ? { condition: 'value > 0' } : {}),
      },
    }

    addNodes([newNode])
    return newNode
  }

  return {
    /** 是否有元素正在拖曳到畫布上方（可用來做視覺高亮） */
    isDragOver,
    /** Sidebar 拖曳開始 */
    onDragStart,
    /** 畫布 dragover 事件 */
    onDragOver,
    /** 畫布 dragleave 事件 */
    onDragLeave,
    /** 畫布 drop 事件 */
    onDrop,
  }
}
