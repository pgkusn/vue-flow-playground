<script setup lang="ts">
import { ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { Node, Edge, Connection } from "@vue-flow/core";

import CustomNode from "./components/CustomNode.vue";
import Sidebar from "./components/Sidebar.vue";
import { initialNodes, initialEdges } from "./initial-elements";

// =========================================
// 狀態管理
// =========================================

const nodes = ref<Node[]>(initialNodes);
const edges = ref<Edge[]>(initialEdges);

/** 節點 ID 計數器 */
let nodeId = 100;

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

const { onConnect, addEdges, addNodes, project, vueFlowRef, fitView } =
  useVueFlow();

/**
 * 當使用者連接兩個節點時
 * 自動建立一條 smoothstep 類型的動畫邊
 */
onConnect((connection: Connection) => {
  addEdges([
    {
      ...connection,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#818cf8" },
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
  };

  const config = categoryConfig[nodeType] || categoryConfig.process;

  const newNode: Node = {
    id,
    type: "custom",
    position,
    data: {
      category: nodeType,
      icon: config.icon,
      title: config.title,
      description: config.description,
      status: "新建立",
    },
  };

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
  nodes.value = [];
  edges.value = [];
  showNotification("已清空畫布 🗑️", "所有節點與連線已被移除");
}

/** 重置為初始狀態 */
function handleReset() {
  nodes.value = [...initialNodes];
  edges.value = [...initialEdges];
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
          :default-edge-options="{ type: 'smoothstep' }"
        >
          <!-- 使用動態作用域插槽 #node-<type> 來渲染自定義節點 -->
          <template #node-custom="nodeProps">
            <CustomNode v-bind="nodeProps" />
          </template>

          <!-- 背景網格 -->
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
</style>
