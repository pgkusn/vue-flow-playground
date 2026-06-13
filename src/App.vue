<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'

import JourneyCanvas from './components/JourneyCanvas.vue'
import Sidebar from './components/Sidebar.vue'
import { loadJourney } from './composables/useJourneyData'
import { useHistory } from './composables/useHistory'
import { nextNodeId } from './composables/useNodeId'

// =========================================
// 狀態管理
// =========================================

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// =========================================
// Undo / Redo 歷史管理
// =========================================

const { canUndo, canRedo, undo, redo, init: initHistory, reset: resetHistory } = useHistory()

/** 工具列按鈕共用 Tailwind 樣式 */
const btnClass =
  'inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded border border-[#dcdfe6] bg-white px-[15px] py-2 text-sm text-[#606266] transition-all hover:border-[#c6e2ff] hover:bg-[#ecf5ff] hover:text-[#409eff] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

// =========================================
// useVueFlow Composable
// =========================================

const { addNodes, removeNodes, findNode, fitView } = useVueFlow()

// =========================================
// 工具列功能
// =========================================

/** 重置為初始狀態（重新載入 data.json） */
async function handleReset() {
  await loadJourneyData()
  resetHistory()
}

/**
 * 載入 data.json 並設定畫布；失敗時清空畫布且不致整頁崩潰。
 */
async function loadJourneyData() {
  try {
    const result = await loadJourney()
    nodes.value = result.nodes
    edges.value = result.edges
    await nextTick()
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50)
  } catch (err) {
    nodes.value = []
    edges.value = []
    console.error('[journey] 載入失敗：', err)
  }
}

// =========================================
// 節點編輯 Modal 狀態與邏輯
// =========================================

const isEditModalOpen = ref(false)
const editingNode = ref<{ id: string; label: string; data: any } | null>(null)

function handleEditNode(payload: { id: string; label: string; data: any }) {
  // 深度拷貝 payload 避免編輯時即時修改畫布上原有的資料 (以支持取消功能)
  editingNode.value = JSON.parse(JSON.stringify(payload))
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingNode.value = null
}

function handleCopyNode(id: string) {
  const targetNode = findNode(id)
  if (!targetNode) return

  // 深度拷貝節點以避免參照污染
  const copiedNode = JSON.parse(JSON.stringify(targetNode))

  // 生成新 ID 與微調位置以免與原節點重合
  copiedNode.id = nextNodeId()
  copiedNode.position = {
    x: copiedNode.position.x + 50,
    y: copiedNode.position.y + 50,
  }

  copiedNode.data.title = `${copiedNode.data.title} (複製品)`
  copiedNode.label = copiedNode.data.title

  addNodes([copiedNode])
}

function handleDeleteNode(id: string) {
  const targetNode = findNode(id)
  if (!targetNode) return

  // 使用 Vue Flow composable 的 removeNodes，會自動處理節點與相關連線的刪除
  removeNodes(id)
}

onMounted(async () => {
  await loadJourneyData()
  // 初始化歷史基準快照
  initHistory()
})
</script>

<template>
  <div id="vue-flow-app">
    <!-- 頂部導覽列 -->
    <header
      class="z-10 flex shrink-0 items-center justify-between bg-white px-6 py-3.5 shadow-[0_0_6px_rgba(0,0,0,0.12)]"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-md bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_50%,#c084fc_100%)] text-sm"
        >
          ⬡
        </div>
        <div>
          <div class="app-header__title text-[15px] font-semibold tracking-[-0.02em]">
            Vue Flow Playground
          </div>
          <div class="text-[11px] font-[JetBrains_Mono,'Fira_Code',monospace] text-[#909399]">
            互動式流程圖編輯器
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Undo / Redo -->
        <div class="btn-group inline-flex">
          <button :class="btnClass" :disabled="!canUndo" @click="undo" title="上一步 (⌘Z)">
            ↩️ 上一步
          </button>
          <button :class="btnClass" :disabled="!canRedo" @click="redo" title="下一步 (⌘⇧Z)">
            ↪️ 下一步
          </button>
        </div>

        <button :class="btnClass" @click="handleReset" title="重置">↩️ 重置</button>
      </div>
    </header>

    <!-- 主要佈局 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左側面板 -->
      <Sidebar />

      <!-- 畫布區域 -->
      <JourneyCanvas
        :nodes
        :edges
        @edit="handleEditNode"
        @copy="handleCopyNode"
        @delete="handleDeleteNode"
      />
    </div>

    <!-- 節點設定彈窗（此階段內容留空、白底） -->
    <Transition name="modal">
      <div
        v-if="isEditModalOpen && editingNode"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(10,10,15,0.75)] backdrop-blur-sm"
        @click.self="closeEditModal"
      >
        <div class="modal-card flex max-h-[90%] min-h-[240px] w-[450px] max-w-[90%] flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl">
          <header class="flex items-center justify-between border-b border-[#e2e8f0] px-[22px] py-[18px]">
            <h3 class="m-0 text-[15px] font-bold text-[#0f172a]">節點設定</h3>
            <button
              class="cursor-pointer border-none bg-transparent p-1 text-[15px] leading-none text-slate-400 transition hover:text-[#0f172a]"
              @click="closeEditModal"
            >
              ✕
            </button>
          </header>
          <main class="flex-1 p-6"></main>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
#vue-flow-app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* 漸層裁切文字：-webkit-text-fill-color 無對應 Tailwind utility，保留 CSS */
.app-header__title {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* btn-group：首尾按鈕圓角合併、相鄰邊框去重（結構選擇器，Tailwind 表達不夠乾淨，保留 CSS） */
.btn-group > button {
  border-radius: 0;
}

.btn-group > button:first-child {
  border-radius: 4px 0 0 4px;
}

.btn-group > button:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

/* Modal 過渡動畫 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.9) translateY(10px);
}
</style>
