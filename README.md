# Vue Flow Playground 🌊

> 使用 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 建立的互動式流程圖編輯器範例程式

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 📖 專案簡介

此專案是一個 **Vue Flow** 的完整範例應用，展示如何使用 `@vue-flow/core` 建立節點式（node-based）互動流程圖。範例以「**LINE 行銷自動化旅程**」為主題（起點 → 等待 → 動作 → 條件分流 → 結束），畫布初始內容載自 `public/data.json`（資料結構見 `docs/api.md`），包含以下功能：

- ✅ 自定義節點元件（一般節點 / 判斷節點）
- ✅ 從 data.json 載入並以 dagre 自動排版
- ✅ 拖放新增節點（Drag & Drop）
- ✅ 自動連線建立與 Yes/No 分支
- ✅ 自定義連線（hover 刪除）
- ✅ undo / redo 歷史記錄
- ✅ 小地圖（MiniMap）、縮放控制（Controls）、背景網格（Background）

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
│   ├── data.json                # 旅程初始資料（畫布載入來源）
│   ├── favicon.svg              # 網站圖示
│   └── icons.svg                # icon sprite
├── src/
│   ├── components/
│   │   ├── JourneyCanvas.vue    # Vue Flow 畫布容器
│   │   ├── JourneyNode.vue      # 一般節點（entry/wait/action/end）
│   │   ├── ConditionNode.vue    # 判斷節點（yes/no 兩輸出）
│   │   ├── CustomEdge.vue       # 自定義連線（hover 刪除、Yes/No 標籤）
│   │   └── Sidebar.vue          # 左側面板（拖曳新增節點）
│   ├── composables/
│   │   ├── useJourneyData.ts    # 載入 data.json 並轉成 nodes/edges
│   │   ├── useJourneyLayout.ts  # dagre 自動排版（由左至右）
│   │   ├── useDnD.ts            # 側邊欄拖曳新增節點
│   │   └── useHistory.ts        # undo / redo 歷史快照
│   ├── main.ts                  # 應用進入點 + CSS 匯入
│   ├── style.css                # 全域樣式 + Vue Flow 主題覆寫
│   └── App.vue                  # 主要應用元件
├── docs/api.md                  # 旅程節點資料結構規格
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
<!-- JourneyNode.vue -->
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

然後直接在 VueFlow 元件中使用動態作用域插槽 `#node-<type>` 來渲染（本專案在 `JourneyCanvas.vue` 以 `#node-journey` / `#node-condition` 註冊）：

```vue
<script setup>
import JourneyNode from './JourneyNode.vue'
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <!-- 使用動態插槽來渲染自定義節點 -->
    <template #node-journey="nodeProps">
      <JourneyNode v-bind="nodeProps" />
    </template>
  </VueFlow>
</template>
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

### 4. 自定義邊（Custom Edges）

為了在連線（Edge）上新增互動元素（例如：滑鼠懸停時顯示「刪除連線」的按鈕），我們可以使用自定義邊。

由於 Vue Flow 的 `EdgeLabelRenderer` 是將內容 Teleport 到獨立的 DOM 容器（`.vue-flow__edge-labels`），使得純 CSS 的 `:hover` 選擇器無法跨越 SVG 與 HTML 邊界來驅動按鈕顯示。本專案採用以下方法解決：
1. **JavaScript 響應式狀態**：使用 `const isHovered = ref(false)`。
2. **透明加粗感應區**：在原本的連線上方疊加一個透明且較寬的 `<path stroke-width="20" stroke="transparent">`。
3. **滑鼠事件驅動**：利用 `@mouseenter` / `@mouseleave` 監聽感應區與按鈕包裹層，從而流暢且精準地控制刪除按鈕的顯示狀態。
4. **調用 Composable 刪除**：點擊按鈕時觸發 `useVueFlow()` 解構出來的 `removeEdges(props.id)` 來移除連線。

#### 自定義邊元件實作示例（`CustomEdge.vue`）：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge, useVueFlow, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()
const { removeEdges } = useVueFlow()
const isHovered = ref(false)

const pathData = computed(() => getSmoothStepPath({
  sourceX: props.sourceX, sourceY: props.sourceY, sourcePosition: props.sourcePosition,
  targetX: props.targetX, targetY: props.targetY, targetPosition: props.targetPosition,
}))
const edgePath = computed(() => pathData.value[0])
const labelX = computed(() => pathData.value[1])
const labelY = computed(() => pathData.value[2])
</script>

<template>
  <!-- 渲染基礎連線 -->
  <BaseEdge :id="id" :path="edgePath" :marker-end="markerEnd" :style="style" />

  <!-- 透明感應區（寬度 20px） -->
  <path :d="edgePath" fill="none" stroke="transparent" stroke-width="20"
        @mouseenter="isHovered = true" @mouseleave="isHovered = false" />

  <!-- 刪除按鈕 -->
  <EdgeLabelRenderer>
    <div :style="{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all' }"
         @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <button v-show="isHovered || selected" class="edge-delete-btn" @click.stop="removeEdges(id)">×</button>
    </div>
  </EdgeLabelRenderer>
</template>
```

#### 在 `App.vue` 註冊與使用自定義邊：

```vue
<script setup>
import CustomEdge from './components/CustomEdge.vue'
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <!-- 使用動態作用域插槽註冊名為 deletable 的邊 -->
    <template #edge-deletable="edgeProps">
      <CustomEdge v-bind="edgeProps" />
    </template>
  </VueFlow>
</template>
```

---

### 5. 使用 useVueFlow Composable

`useVueFlow` 是 Vue Flow 提供的核心 Composable，提供各種方法和事件：

```vue
<script setup>
import { useVueFlow } from '@vue-flow/core'

const {
  onConnect,       // 連線建立事件
  addNodes,        // 新增節點
  addEdges,        // 新增邊
  removeNodes,     // 移除節點
  removeEdges,     // 移除邊
  fitView,         // 適配畫面
  project,         // 座標轉換（螢幕座標 → 畫布座標）
  toObject,        // 匯出當前狀態
} = useVueFlow()

// 監聽連線事件，建立 type 為 'deletable' 的自定義連線
onConnect((connection) => {
  addEdges([{ ...connection, type: 'deletable' }])
})
</script>
```

---

### 6. 拖放功能（Drag & Drop）

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

---

### 7. 外掛（Plugins）

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
