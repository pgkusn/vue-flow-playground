import { ref, computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useDebounceFn, useTimeoutFn } from '@vueuse/core'

/**
 * useHistory — 上一步 / 下一步（undo / redo）
 *
 * 透過 Vue Flow 的 toObject / fromObject 進行完整快照，
 * 監聽 onNodesChange / onEdgesChange 自動記錄，以 debounce 避免高頻記錄。
 */
export function useHistory() {
  const { toObject, fromObject, onNodesChange, onEdgesChange } = useVueFlow()

  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])

  /** 當前狀態的快照字串 */
  let current: string | null = null
  /** 是否正在套用快照（期間不記錄） */
  let applying = false

  /** 套用快照後延遲恢復記錄的等待毫秒（init 用 500、apply 用 400） */
  const resumeDelay = ref(500)
  const { start: scheduleResume } = useTimeoutFn(
    () => { applying = false },
    resumeDelay,
    { immediate: false },
  )

  /** 取得當前 Vue Flow 完整狀態的 JSON 字串 */
  function snapshot(): string {
    return JSON.stringify(toObject())
  }

  /** 畫布就緒後呼叫，建立初始基準 */
  function init() {
    applying = true
    current = snapshot()
    // 等初始渲染觸發的 change 事件結束後再開始記錄
    resumeDelay.value = 500
    scheduleResume()
  }

  /** 重設歷史（例如重置畫布後呼叫） */
  function reset() {
    undoStack.value = []
    redoStack.value = []
    current = snapshot()
  }

  /**
   * 記錄一次變更
   * 使用 300ms debounce，避免拖曳等高頻操作產生大量快照。
   * 只有當狀態真正變化時才推入堆疊。
   */
  const commit = useDebounceFn(() => {
    const snap = snapshot()
    if (snap === current) return
    undoStack.value.push(current!)
    if (undoStack.value.length > 50) undoStack.value.shift()
    redoStack.value = []
    current = snap
  }, 300)

  function record() {
    if (applying || current === null) return
    commit()
  }

  // 自動監聽節點與邊的變更
  onNodesChange(record)
  onEdgesChange(record)

  /** 套用快照：使用 fromObject 還原完整狀態 */
  async function apply(snap: string) {
    applying = true
    await fromObject(JSON.parse(snap))
    current = snap
    // 等 fromObject 觸發的 change 事件結束後再恢復記錄
    resumeDelay.value = 400
    scheduleResume()
  }

  /** 還原到上一步 */
  async function undo() {
    if (!undoStack.value.length || current === null) return
    const snap = undoStack.value.pop()!
    redoStack.value.push(current)
    await apply(snap)
  }

  /** 重做下一步 */
  async function redo() {
    if (!redoStack.value.length || current === null) return
    const snap = redoStack.value.pop()!
    undoStack.value.push(current)
    await apply(snap)
  }

  return {
    undo,
    redo,
    init,
    reset,
    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
  }
}
