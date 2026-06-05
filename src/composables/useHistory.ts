import { ref, watch, type Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface HistorySnapshot {
  nodes: Node[]
  edges: Edge[]
}

/**
 * useHistory — 提供 undo / redo 功能的 composable
 *
 * 監聽 nodes 與 edges 的變化，自動記錄快照到歷史堆疊中。
 * 提供 undo() / redo() 方法與 canUndo / canRedo 狀態。
 */
export function useHistory(
  nodes: Ref<Node[]>,
  edges: Ref<Edge[]>,
  options: { maxHistory?: number } = {},
) {
  const { maxHistory = 50 } = options

  /** 歷史堆疊 */
  const undoStack = ref<HistorySnapshot[]>([])
  /** 重做堆疊 */
  const redoStack = ref<HistorySnapshot[]>([])

  /** 是否可以 undo / redo */
  const canUndo = ref(false)
  const canRedo = ref(false)

  /** 內部旗標：跳過由 undo/redo 本身觸發的 watch */
  let isRestoring = false

  /** 將當前狀態快照化（深拷貝） */
  function takeSnapshot(): HistorySnapshot {
    return {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
    }
  }

  /** 更新 canUndo / canRedo 狀態 */
  function updateFlags() {
    canUndo.value = undoStack.value.length > 0
    canRedo.value = redoStack.value.length > 0
  }

  /** 手動記錄一次快照（在執行操作前呼叫） */
  function record() {
    if (isRestoring) return
    undoStack.value.push(takeSnapshot())
    if (undoStack.value.length > maxHistory) {
      undoStack.value.shift()
    }
    // 新操作會清空 redo 堆疊
    redoStack.value = []
    updateFlags()
  }

  /** 還原到上一步 */
  function undo() {
    if (undoStack.value.length === 0) return

    const snapshot = undoStack.value.pop()!
    // 把當前狀態推入 redo
    redoStack.value.push(takeSnapshot())

    isRestoring = true
    nodes.value = snapshot.nodes
    edges.value = snapshot.edges
    // 等 Vue 的響應完成後再取消旗標
    setTimeout(() => { isRestoring = false }, 0)

    updateFlags()
  }

  /** 重做下一步 */
  function redo() {
    if (redoStack.value.length === 0) return

    const snapshot = redoStack.value.pop()!
    // 把當前狀態推入 undo
    undoStack.value.push(takeSnapshot())

    isRestoring = true
    nodes.value = snapshot.nodes
    edges.value = snapshot.edges
    setTimeout(() => { isRestoring = false }, 0)

    updateFlags()
  }

  /** 清空歷史 */
  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
    updateFlags()
  }

  return {
    canUndo,
    canRedo,
    record,
    undo,
    redo,
    clearHistory,
  }
}
