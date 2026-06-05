<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { Node, Edge, Connection } from "@vue-flow/core";

import CustomNode from "./components/CustomNode.vue";
import ConditionNode from "./components/ConditionNode.vue";
import CustomEdge from "./components/CustomEdge.vue";
import Sidebar from "./components/Sidebar.vue";
import { initialNodes, initialEdges } from "./initial-elements";
import { useHistory } from "./composables/useHistory";

// =========================================
// 狀態管理
// =========================================

const nodes = ref<Node[]>(initialNodes);
const edges = ref<Edge[]>(initialEdges);

/** 節點 ID 計數器 */
let nodeId = 100;

// =========================================
// Undo / Redo 歷史管理
// =========================================

const { canUndo, canRedo, record, undo, redo, clearHistory } = useHistory(nodes, edges);

/** Toast 通知 */
const showToast = ref(true);
const toastMessage = ref({
  title: "歡迎使用 Vue Flow Playground 👋",
  content:
    "這是一個資料處理管線的範例。你可以拖曳左側面板的節點到畫布上、建立連線、或移動現有節點。",
});

// =========================================
// useVueFlow Composable
// =========================================

const {
  onConnect,
  addEdges,
  addNodes,
  removeNodes,
  findNode,
  project,
  vueFlowRef,
  fitView,
} = useVueFlow();

/**
 * 當使用者連接兩個節點時
 * 自動建立一條動畫邊；若來源為條件節點的 yes/no Handle 則自動標註
 */
onConnect((connection: Connection) => {
  record();
  const handleId = connection.sourceHandle;

  // 根據 sourceHandle 決定標籤與配色
  const branchConfig: Record<string, { label: string; stroke: string }> = {
    yes: { label: "✓ Yes", stroke: "#34d399" },
    no:  { label: "✗ No",  stroke: "#fb7185" },
  };
  const branch = handleId ? branchConfig[handleId] : null;

  addEdges([
    {
      ...connection,
      type: "deletable",
      animated: true,
      ...(branch
        ? {
            label: branch.label,
            style: { stroke: branch.stroke },
            markerEnd: { type: MarkerType.ArrowClosed, color: branch.stroke },
          }
        : {
            style: { stroke: "#818cf8" },
          }),
    },
  ]);
  showNotification(
    "連線建立 ✅",
    `${connection.source} → ${connection.target}`,
  );
});

// =========================================
// 拖放 (Drag & Drop) 處理
// =========================================

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

/**
 * 拖放節點到畫布時觸發
 * 根據節點類型建立對應的自定義節點
 */
function onDrop(event: DragEvent) {
  if (!event.dataTransfer) return;

  const nodeType = event.dataTransfer.getData("application/vueflow");
  if (!nodeType) return;

  // 計算畫布座標
  const { left, top } = vueFlowRef.value!.getBoundingClientRect();
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  const id = `node-${++nodeId}`;

  const categoryConfig: Record<
    string,
    { icon: string; title: string; description: string }
  > = {
    input: { icon: "📥", title: "新輸入節點", description: "設定資料來源" },
    process: { icon: "⚙️", title: "新處理節點", description: "資料處理邏輯" },
    output: { icon: "📤", title: "新輸出節點", description: "輸出目的地" },
    data: { icon: "💾", title: "新資料節點", description: "資料儲存" },
    condition: { icon: "🔀", title: "新條件節點", description: "條件判斷" },
  };

  const config = categoryConfig[nodeType] || categoryConfig.process;

  const newNode: Node = {
    id,
    type: nodeType === "condition" ? "condition" : "custom",
    position,
    data: {
      category: nodeType,
      icon: config.icon,
      title: config.title,
      description: config.description,
      status: "新建立",
      ...(nodeType === "condition" ? { condition: "value > 0" } : {}),
    },
  };

  record();
  addNodes([newNode]);
  showNotification("節點新增 ✨", `已建立 ${config.title} (${id})`);
}

// =========================================
// 工具列功能
// =========================================

/** 適配畫面 */
function handleFitView() {
  fitView({ padding: 0.2, duration: 400 });
}

/** 清除所有節點與邊 */
function handleClear() {
  record();
  nodes.value = [];
  edges.value = [];
  showNotification("已清空畫布 🗑️", "所有節點與連線已被移除");
}

/** 重置為初始狀態 */
function handleReset() {
  record();
  nodes.value = [...initialNodes];
  edges.value = [...initialEdges];
  clearHistory();
  setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  showNotification("已重置 ↩️", "畫布已恢復為初始狀態");
}

/** 匯出畫布資料 */
function handleExport() {
  const data = {
    nodes: nodes.value,
    edges: edges.value,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vue-flow-export.json";
  a.click();
  URL.revokeObjectURL(url);
  showNotification("匯出成功 📦", "流程圖資料已儲存為 JSON 檔案");
}

// =========================================
// Toast 通知
// =========================================

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showNotification(title: string, content: string) {
  toastMessage.value = { title, content };
  showToast.value = true;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
  }, 4000);
}

function closeToast() {
  showToast.value = false;
  if (toastTimer) clearTimeout(toastTimer);
}

// =========================================
// 節點編輯 Modal 狀態與邏輯
// =========================================

const isEditModalOpen = ref(false);
const editingNode = ref<{ id: string; label: string; data: any } | null>(null);

function handleEditNode(payload: { id: string; label: string; data: any }) {
  // 深度拷貝 payload 避免編輯時即時修改畫布上原有的資料 (以支持取消功能)
  editingNode.value = JSON.parse(JSON.stringify(payload));
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editingNode.value = null;
}

function saveNodeChanges() {
  if (!editingNode.value) return;

  const nodeIndex = nodes.value.findIndex((n) => n.id === editingNode.value!.id);
  if (nodeIndex !== -1) {
    record();
    const targetNode = nodes.value[nodeIndex];
    // 更新資料
    targetNode.data.title = editingNode.value.data.title;
    targetNode.data.description = editingNode.value.data.description;
    targetNode.data.status = editingNode.value.data.status;
    targetNode.label = editingNode.value.data.title; // 同步更新 label
    
    closeEditModal();
    showNotification("節點已更新 ⚙️", `節點 "${editingNode.value.data.title}" 的設定已儲存！`);
  }
}

function handleCopyNode(id: string) {
  const targetNode = findNode(id);
  if (!targetNode) return;

  // 深度拷貝節點以避免參照污染
  const copiedNode = JSON.parse(JSON.stringify(targetNode));
  
  // 生成新 ID 與微調位置以免與原節點重合
  const newId = `node-${++nodeId}`;
  copiedNode.id = newId;
  copiedNode.position = {
    x: copiedNode.position.x + 50,
    y: copiedNode.position.y + 50,
  };
  
  copiedNode.data.title = `${copiedNode.data.title} (複製品)`;
  copiedNode.label = copiedNode.data.title;
  
  record();
  addNodes([copiedNode]);
  showNotification("複製成功 📋", `已複製產生 "${copiedNode.data.title}"`);
}

function handleDeleteNode(id: string) {
  const targetNode = findNode(id);
  if (!targetNode) return;

  const nodeTitle = targetNode.data.title;

  record();
  // 使用 Vue Flow composable 的 removeNodes，會自動處理節點與相關連線的刪除
  removeNodes(id);
  
  showNotification("刪除成功 🗑️", `已刪除節點 "${nodeTitle}"`);
}

// =========================================
// 鍵盤快捷鍵
// =========================================

function handleKeyDown(e: KeyboardEvent) {
  const isMeta = e.metaKey || e.ctrlKey;
  if (isMeta && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (isMeta && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    redo();
  } else if (isMeta && e.key === 'y') {
    e.preventDefault();
    redo();
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<template>
  <div id="vue-flow-app">
    <!-- 頂部導覽列 -->
    <header class="app-header">
      <div class="app-header__logo">
        <div class="app-header__logo-icon">⬡</div>
        <div>
          <div class="app-header__title">Vue Flow Playground</div>
          <div class="app-header__subtitle">互動式流程圖編輯器</div>
        </div>
      </div>

      <div class="app-header__actions">
        <!-- 狀態列 -->
        <div class="stats-bar">
          <div class="stats-bar__item">
            <span class="stats-bar__dot stats-bar__dot--nodes"></span>
            {{ nodes.length }} 節點
          </div>
          <div class="stats-bar__item">
            <span class="stats-bar__dot stats-bar__dot--edges"></span>
            {{ edges.length }} 連線
          </div>
        </div>

        <!-- Undo / Redo -->
        <div class="btn-group">
          <button
            class="btn"
            :class="{ 'btn--disabled': !canUndo }"
            :disabled="!canUndo"
            @click="undo"
            title="上一步 (⌘Z)"
          >
            ↩️ 上一步
          </button>
          <button
            class="btn"
            :class="{ 'btn--disabled': !canRedo }"
            :disabled="!canRedo"
            @click="redo"
            title="下一步 (⌘⇧Z)"
          >
            ↪️ 下一步
          </button>
        </div>

        <button class="btn" @click="handleFitView" title="適配畫面">
          🔍 適配
        </button>
        <button
          class="btn btn--primary"
          @click="handleExport"
          title="匯出 JSON"
        >
          📦 匯出
        </button>
        <button class="btn" @click="handleReset" title="重置">↩️ 重置</button>
        <button class="btn btn--danger" @click="handleClear" title="清空">
          🗑️ 清空
        </button>
      </div>
    </header>

    <!-- 主要佈局 -->
    <div class="app-layout">
      <!-- 左側面板 -->
      <Sidebar />

      <!-- 畫布區域 -->
      <div class="canvas-wrapper" @dragover="onDragOver" @drop="onDrop">
        <VueFlow
          :nodes
          :edges
          :min-zoom="0.2"
          :max-zoom="4"
          fit-view-on-init
          :default-edge-options="{ type: 'deletable' }"
        >
          <!-- 使用動態作用域插槽 #node-<type> 來渲染自定義節點 -->
          <template #node-custom="nodeProps">
            <CustomNode 
              v-bind="nodeProps" 
              @edit="handleEditNode" 
              @copy="handleCopyNode"
              @delete="handleDeleteNode"
            />
          </template>

          <!-- 條件分支節點 -->
          <template #node-condition="nodeProps">
            <ConditionNode
              v-bind="nodeProps"
              @edit="handleEditNode"
              @copy="handleCopyNode"
              @delete="handleDeleteNode"
            />
          </template>

          <!-- 使用動態作用域插槽 #edge-<type> 來渲染自定義 Edge -->
          <template #edge-deletable="edgeProps">
            <CustomEdge v-bind="edgeProps" />
          </template>

          <Background :gap="20" :size="1" />

          <!-- 控制按鈕 -->
          <Controls />

          <!-- 小地圖 -->
          <MiniMap pannable zoomable />
        </VueFlow>

        <!-- Toast 通知 -->
        <Transition name="toast">
          <div v-if="showToast" class="info-toast">
            <button class="info-toast__close" @click="closeToast">✕</button>
            <div class="info-toast__title">{{ toastMessage.title }}</div>
            <div class="info-toast__content">{{ toastMessage.content }}</div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 節點資料編輯彈窗 Modal -->
    <Transition name="modal">
      <div v-if="isEditModalOpen && editingNode" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-card">
          <header class="modal-card__header">
            <h3 class="modal-card__title">⚙️ 編輯節點設定</h3>
            <span class="modal-card__id">ID: {{ editingNode.id }}</span>
          </header>

          <main class="modal-card__body">
            <div class="form-group">
              <label class="form-label">節點標題</label>
              <input v-model="editingNode.data.title" type="text" class="form-input" placeholder="請輸入節點名稱">
            </div>

            <div class="form-group">
              <label class="form-label">節點描述</label>
              <textarea v-model="editingNode.data.description" rows="3" class="form-input form-input--textarea" placeholder="請輸入節點的描述資訊"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">運行狀態</label>
              <select v-model="editingNode.data.status" class="form-input form-input--select">
                <option value="已就緒">已就緒</option>
                <option value="運行中">運行中</option>
                <option value="等待中">等待中</option>
                <option value="已停用">已停用</option>
              </select>
            </div>
          </main>

          <footer class="modal-card__footer">
            <button class="btn btn--outline" @click="closeEditModal">取消</button>
            <button class="btn btn--primary" @click="saveNodeChanges">儲存變更</button>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Toast 過渡動畫 */
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideIn 0.2s ease-in reverse;
}

#vue-flow-app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* Modal 樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 450px;
  max-width: 90%;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(129, 140, 248, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-card__header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-card__title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.modal-card__id {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  background: var(--bg-surface);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.modal-card__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 10px 12px;
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  transition: all var(--transition-fast);
}

.form-input:focus {
  border-color: var(--accent-indigo);
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
}

.form-input--textarea {
  resize: none;
}

.form-input--select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239898b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.modal-card__footer {
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn--outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn--outline:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

/* Modal 過渡動畫 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card, .modal-leave-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-card, .modal-leave-to .modal-card {
  transform: scale(0.9) translateY(10px);
}
</style>
