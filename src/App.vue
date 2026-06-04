<script setup lang="ts">
import { ref } from "vue";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { Node, Edge, Connection } from "@vue-flow/core";
import SimpleCustomNode from "./components/SimpleCustomNode.vue";
import { initialNodes, initialEdges } from "./initial-elements";

// 節點與連線的響應式狀態
const nodes = ref<Node[]>(initialNodes);
const edges = ref<Edge[]>(initialEdges);

/**
 * 處理連線建立事件
 * 當使用者在畫布上拖曳連線並連接兩個節點時觸發
 */
const onConnect = (connection: Connection) => {
  // 將新連線加入 edges 陣列
  edges.value.push({
    id: `e-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    animated: true, // 新建連線帶有動態流動效果
    style: { stroke: "#10b981" }, // 綠色連線
  });
};
</script>

<template>
  <div id="vue-flow-app">
    <!-- 頂部導覽列 -->
    <header class="app-header">
      <div class="app-header__logo">
        <span class="logo-symbol">⬡</span>
        <div>
          <h1 class="app-title">Vue Flow 簡易範例</h1>
          <p class="app-subtitle">展示基礎節點類型與連線功能</p>
        </div>
      </div>
    </header>

    <!-- 畫布區域 -->
    <main class="canvas-container">
      <VueFlow
        :nodes
        :edges
        :fit-view-on-init="true"
        @connect="onConnect"
      >
        <!-- 使用動態作用域插槽 #node-<type> 來渲染自定義節點 -->
        <template #node-simple-custom="nodeProps">
          <SimpleCustomNode v-bind="nodeProps" />
        </template>

        <!-- 背景網格 -->
        <Background :gap="20" pattern-color="#374151" />

        <!-- 控制按鈕 (縮放、適配) -->
        <Controls />

        <!-- 右下角小地圖 -->
        <MiniMap />
      </VueFlow>
    </main>
  </div>
</template>

<style>
#vue-flow-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #0f172a; /* 深色背景 */
  color: #f8fafc;
  font-family: "DM Sans", sans-serif;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 10;
}

.app-header__logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-symbol {
  font-size: 2.2rem;
  color: #10b981;
  font-weight: bold;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.2rem 0 0 0;
}

.canvas-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
