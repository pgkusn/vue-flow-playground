# Vue Flow Playground 🌊

> 使用 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 建立的互動式流程圖編輯器範例程式

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 📖 專案簡介

此專案是一個 **Vue Flow** 的完整範例應用，展示如何使用 `@vue-flow/core` 建立節點式（node-based）互動流程圖。範例以「**資料處理管線**」為主題，包含以下功能：

- ✅ 自定義節點元件（Custom Nodes）
- ✅ 拖放新增節點（Drag & Drop）
- ✅ 自動連線建立
- ✅ 小地圖（MiniMap）
- ✅ 縮放控制按鈕（Controls）
- ✅ 背景網格（Background）
- ✅ 匯出流程圖為 JSON
- ✅ 深色主題設計

---

## 🚀 快速開始

### 前置需求

- **Node.js** >= 20
- **npm** >= 10（或使用 pnpm / yarn）

### 安裝與執行

```bash
# 1. 進入專案目錄
cd vue-flow-playground

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

開發伺服器啟動後，瀏覽器開啟 `http://localhost:5173` 即可看到範例。

---

## 🏗️ 專案結構

```
vue-flow-playground/
├── public/
│   └── favicon.svg              # 網站圖示
├── src/
│   ├── components/
│   │   ├── CustomNode.vue       # 自定義節點元件
│   │   └── Sidebar.vue          # 左側面板（拖曳節點 + 說明）
│   ├── initial-elements.ts      # 初始節點與邊的資料定義
│   ├── main.ts                  # 應用進入點 + CSS 匯入
│   ├── style.css                # 全域樣式 + Vue Flow 主題覆寫
│   └── App.vue                  # 主要應用元件
├── index.html                   # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📚 核心概念說明

### 1. Vue Flow 基本架構

Vue Flow 的核心由三個概念組成：

| 概念 | 說明 |
|:---|:---|
| **Node（節點）** | 流程圖上的方塊，包含 `id`、`position`、`type`、`data` 等屬性 |
| **Edge（邊/連線）** | 連接兩個節點的線條，包含 `source` 和 `target` |
| **Handle（連接點）** | 節點上的圓形端點，分為 `source`（輸出）和 `target`（輸入） |

```vue
<template>
  <!-- VueFlow 容器必須有固定高度 -->
  <div style="height: 500px">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" />
  </div>
</template>
```

### 2. 節點類型（Node Types）

Vue Flow 提供三種內建節點：

| 類型 | 說明 |
|:---|:---|
| `input` | 起始節點，只有 source handle |
| `default` | 預設節點，同時有 source 和 target handle |
| `output` | 結束節點，只有 target handle |

你也可以透過 **自定義節點** 來完全掌控外觀：

```vue
<!-- CustomNode.vue -->
<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['id', 'data'])
</script>

<template>
  <div class="my-node">
    <Handle type="target" :position="Position.Left" />
    <div>{{ data.title }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
```

然後在 VueFlow 中註冊：

```vue
<script setup>
import { markRaw } from 'vue'
import CustomNode from './CustomNode.vue'

// ⚠️ 重要：使用 markRaw 避免 Vue 對元件進行響應式處理
const nodeTypes = { custom: markRaw(CustomNode) }
</script>

<VueFlow :node-types="nodeTypes" />
```

### 3. 邊的類型（Edge Types）

| 類型 | 說明 |
|:---|:---|
| `bezier` | 貝茲曲線（預設） |
| `straight` | 直線 |
| `step` | 直角折線 |
| `smoothstep` | 圓角折線 |

```ts
const edges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',   // 邊的類型
    animated: true,       // 動畫效果
    style: { stroke: '#818cf8' },
  },
]
```

### 4. 使用 useVueFlow Composable

`useVueFlow` 是 Vue Flow 提供的核心 Composable，提供各種方法和事件：

```vue
<script setup>
import { useVueFlow } from '@vue-flow/core'

const {
  onConnect,       // 連線建立事件
  addNodes,        // 新增節點
  addEdges,        // 新增邊
  removeNodes,     // 移除節點
  fitView,         // 適配畫面
  project,         // 座標轉換（螢幕座標 → 畫布座標）
  toObject,        // 匯出當前狀態
} = useVueFlow()

// 監聽連線事件
onConnect((connection) => {
  addEdges([{ ...connection, type: 'smoothstep' }])
})
</script>
```

### 5. 拖放功能（Drag & Drop）

實現從側邊欄拖曳節點到畫布的流程：

```ts
// Sidebar：設定 dataTransfer
function onDragStart(event: DragEvent, nodeType: string) {
  event.dataTransfer.setData('application/vueflow', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}

// Canvas：監聽 drop 事件
function onDrop(event: DragEvent) {
  const type = event.dataTransfer.getData('application/vueflow')

  // 使用 project() 將螢幕座標轉換為畫布座標
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  addNodes([{ id: 'new', type: 'custom', position, data: { ... } }])
}
```

### 6. 外掛（Plugins）

Vue Flow 提供三個官方外掛：

```bash
npm install @vue-flow/background @vue-flow/controls @vue-flow/minimap
```

```vue
<script setup>
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

// ⚠️ 必須匯入各外掛的 CSS
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
</script>

<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges">
    <Background :gap="20" />
    <Controls />
    <MiniMap pannable zoomable />
  </VueFlow>
</template>
```

---

## ⚠️ 常見注意事項

1. **VueFlow 容器必須有固定高度**，否則畫布不會渲染
2. **必須匯入 CSS 樣式**：
   ```ts
   import '@vue-flow/core/dist/style.css'
   import '@vue-flow/core/dist/theme-default.css'
   ```
3. **自定義節點元件需使用 `markRaw()`**，避免不必要的響應式開銷
4. **不要使用 `<style scoped>`** 來覆寫 Vue Flow 的樣式，否則不會生效
5. **Handle** 的 `type` 決定連線方向：`source` = 輸出端、`target` = 輸入端

---

## 🔧 可用指令

| 指令 | 說明 |
|:---|:---|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建構生產版本 |
| `npm run preview` | 預覽生產建構結果 |

---

## 📦 使用的套件

| 套件 | 說明 |
|:---|:---|
| [`@vue-flow/core`](https://vueflow.dev) | Vue Flow 核心庫 |
| [`@vue-flow/background`](https://vueflow.dev) | 背景網格外掛 |
| [`@vue-flow/controls`](https://vueflow.dev) | 縮放控制外掛 |
| [`@vue-flow/minimap`](https://vueflow.dev) | 小地圖外掛 |
| [`vue`](https://vuejs.org) | Vue 3 框架 |
| [`vite`](https://vite.dev) | 建構工具 |
| [`typescript`](https://www.typescriptlang.org) | 型別系統 |

---

## 📖 延伸學習

- [Vue Flow 官方文件](https://vueflow.dev)
- [Vue Flow GitHub](https://github.com/bcakmakoglu/vue-flow)
- [Vue Flow 範例集](https://vueflow.dev/examples/)
- [Vue 3 文件](https://vuejs.org)

---

## 📄 授權

MIT License
