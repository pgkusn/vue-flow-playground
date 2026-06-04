# Vue Flow 簡易範例 🌊

> 本專案為 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 的極簡範例，旨在以最直覺的方式展示 Vue Flow 核心概念、內建節點與自定義節點的使用方法。

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)

---

## 📖 專案特色

此專案為 **簡易版**，去除複雜拖放邏輯與多種花俏的自訂元件，專注於展示 Vue Flow 最核心的用法：

- ⚙️ **內建與自定義節點**：同時展示三種內建標準節點（`input`, `default`, `output`），並包含一個極簡的 `simple-custom` 自定義節點。
- 🔗 **互動式連線**：使用最基礎的事件綁定（`@connect`）實現使用者在畫布上的滑鼠拖曳拉線。
- 🛠️ **官方外掛整合**：包含 `Background`（背景網格）、`Controls`（控制面板）、`MiniMap`（小地圖）。
- 🎨 **暗色主題**：使用精美的 Tailwind-like CSS 暗色調風格覆寫官方樣式。

---

## 🚀 快速開始

### 前置需求
- **Node.js** >= 20
- **npm** >= 10

### 安裝與執行

```bash
# 1. 複製並進入本 Worktree 目錄
cd vue-flow-playground-simple

# 2. 安裝依賴 (本目錄已與主目錄共享 node_modules)
npm install # 若未連結，此指令會下載依賴

# 3. 啟動開發伺服器
npm run dev
```

瀏覽器開啟 `http://localhost:5173` 即可看到流程圖。

---

## 🏗️ 專案結構

此簡易版的專案結構非常單純，移除了所有複雜組件：

```text
vue-flow-playground-simple/
├── public/
│   └── favicon.svg              # 網站圖示
├── src/
│   ├── components/
│   │   └── SimpleCustomNode.vue # 簡易自定義節點元件 🌟
│   ├── initial-elements.ts      # 初始節點與邊的資料定義 (含 3 個節點，其中 1 個為自定義類型)
│   ├── main.ts                  # 應用進入點
│   ├── style.css                # 基礎暗色主題與 Vue Flow 樣式覆寫
│   └── App.vue                  # 主要元件 (包含畫布渲染、節點註冊與連線邏輯)
├── index.html                   # HTML 進入點
├── package.json
└── vite.config.ts
```

---

## 📚 核心代碼解析

### 1. 節點定義 (`src/initial-elements.ts`)

```typescript
import type { Node, Edge } from '@vue-flow/core'

export const initialNodes: Node[] = [
  { id: 'node-1', type: 'input', label: '輸入節點', position: { x: 150, y: 150 } },
  { 
    id: 'node-2', 
    type: 'simple-custom', // 指定使用自定義節點
    label: '自訂處理節點', 
    position: { x: 400, y: 150 },
    data: { emoji: '⚙️', title: '自訂處理節點', description: '執行資料篩選與轉換' }
  },
  { id: 'node-3', type: 'output', label: '輸出節點', position: { x: 650, y: 150 } },
]

export const initialEdges: Edge[] = [
  { id: 'edge-1-2', source: 'node-1', target: 'node-2', animated: true },
]
```

### 2. 自定義節點元件 (`src/components/SimpleCustomNode.vue`)

使用官方的 `Handle` 宣告連接孔，並透過 `Position` 決定其出入口位置（本範例為上下連線）：

```vue
<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
defineProps<{
  id: string
  data: { emoji: string; title: string; description: string }
}>()
</script>

<template>
  <div class="simple-custom-node">
    <Handle type="target" :position="Position.Top" /> <!-- 輸入孔 (上方) -->
    <div class="node-content">
      <span>{{ data.emoji }}</span>
      <div>
        <h4>{{ data.title }}</h4>
        <p>{{ data.description }}</p>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" /> <!-- 輸出孔 (下方) -->
  </div>
</template>
```

### 3. 作用域插槽與畫布渲染 (`src/App.vue`)

Vue Flow 支援使用動態作用域插槽 `#node-<type>` 來直接渲染自定義節點。此方式非常直覺，且無須在 script 中使用 `nodeTypes` 註冊與 `markRaw()` 包裹組件。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Connection } from '@vue-flow/core'
import SimpleCustomNode from './components/SimpleCustomNode.vue'
import { initialNodes, initialEdges } from './initial-elements'

const nodes = ref(initialNodes)
const edges = ref(initialEdges)

const onConnect = (connection: Connection) => {
  edges.value.push({
    id: `e-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    animated: true,
    style: { stroke: '#10b981' },
  })
}
</script>

<template>
  <div style="height: 100vh">
    <VueFlow :nodes :edges @connect="onConnect">
      <!-- 使用動態作用域插槽 #node-<type> 來渲染自定義節點 -->
      <template #node-simple-custom="nodeProps">
        <SimpleCustomNode v-bind="nodeProps" />
      </template>

      <Background />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>
```

---

## 📊 簡報簡介

本分支中包含專為此簡易版設計的 PPTX 簡報文件：
- 📂 **簡報檔案**：[Vue-Flow-Simple-Tutorial.pptx](file:///Users/kenge.hsieh/playground/vue-flow-playground-simple/Vue-Flow-Simple-Tutorial.pptx)
- 🖥️ **簡報大綱**：
  1. **Vue Flow 快速上手**：介紹什麼是 Vue Flow 及其使用場景。
  2. **安裝與環境設定**：僅需三步即可在 Vite + Vue 專案中完成整合。
  3. **核心概念 (Nodes & Edges)**：介紹 input、default、output 等內建節點。
  4. **自定義節點與動態插槽**：圖解如何開發自定義節點卡片，並搭配 Vue 作用域插槽（Dynamic Slots `#node-<type>`）直接完成渲染，無須手動註冊。
  5. **連線邏輯 (@connect)**：如何使用最基礎的事件捕獲，讓使用者自主畫出有向圖。
  6. **外掛整合**：使用 Background, Controls 和 MiniMap 加強使用者體驗。
