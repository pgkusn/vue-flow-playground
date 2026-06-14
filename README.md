# Vue Flow Playground 🌊

> 使用 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 建立的互動式流程圖編輯器範例程式

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-6+-3178c6?style=flat-square&logo=typescript)
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
- ✅ 儲存（以 `toObject()` 輸出可序列化狀態，預備串接 API）
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
│   │   ├── JourneyCanvas/           # 畫布相關元件
│   │   │   ├── index.vue            # Vue Flow 畫布容器
│   │   │   ├── DefaultNode.vue      # 一般節點（entry/wait/action/end）
│   │   │   ├── ConditionNode.vue    # 判斷節點（yes/no 兩輸出）
│   │   │   └── CustomEdge.vue       # 自定義連線（hover 刪除、Yes/No 標籤）
│   │   └── Sidebar.vue          # 左側面板（拖曳新增節點）
│   ├── composables/
│   │   ├── useJourneyData.ts    # 載入 data.json 並轉成 nodes/edges
│   │   ├── useJourneyLayout.ts  # dagre 自動排版（由左至右）
│   │   ├── useDnD.ts            # 側邊欄拖曳新增節點
│   │   ├── useHistory.ts        # undo / redo 歷史快照
│   │   └── useNodeId.ts         # 共用的節點 ID 產生器（nextNodeId）
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
<!-- DefaultNode.vue -->
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

然後直接在 VueFlow 元件中使用動態作用域插槽 `#node-<type>` 來渲染（本專案在 `JourneyCanvas/index.vue` 以 `#node-default` / `#node-condition` 註冊）：

```vue
<script setup>
import DefaultNode from './DefaultNode.vue'
</script>

<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges">
    <!-- 使用動態插槽來渲染自定義節點 -->
    <template #node-default="nodeProps">
      <DefaultNode v-bind="nodeProps" />
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

本專案的作法是把刪除按鈕放在 edge 的 SVG `<g>` 子樹內（而非 Teleport 出去的 `EdgeLabelRenderer`），讓純 CSS 的 `:hover` 就能驅動顯示，無閃爍：
1. **透明加粗感應區**：在原本的連線上方疊加一個透明且較寬的 `<path stroke-width="20" stroke="transparent">`，擴大滑鼠感應範圍，使線段任一處都能觸發 hover。
2. **全域 CSS 控制顯示**：刪除按鈕預設 `opacity: 0`，由非 scoped 的全域選擇器 `.vue-flow__edge:hover` / `.vue-flow__edge.selected` 切換顯示（見 `JourneyCanvas/index.vue` 的 `.edge-delete-btn` 樣式），不需 JavaScript 響應式狀態。
3. **調用 Composable 刪除**：點擊按鈕時觸發 `useVueFlow()` 解構出來的 `removeEdges(props.id)` 來移除連線。

#### 自定義邊元件實作示例（`CustomEdge.vue`）：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getSmoothStepPath, BaseEdge, useVueFlow, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()
const { removeEdges } = useVueFlow()

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
  <BaseEdge :id="id" :path="edgePath" :style="style" />

  <!-- 透明感應區（寬度 20px）：擴大 hover 範圍 -->
  <path :d="edgePath" fill="none" stroke="transparent" stroke-width="20" style="cursor: pointer" />

  <!-- 刪除按鈕放在 edge 的 SVG <g> 內，顯示與否交由全域 CSS（.vue-flow__edge:hover）控制 -->
  <foreignObject :x="labelX - 16" :y="labelY - 16" width="32" height="32" style="overflow: visible">
    <button class="edge-delete-btn" @click.stop="removeEdges(id)">×</button>
  </foreignObject>
</template>
```

> 📌 為求精簡，上方範例只示範核心結構。實際的 `CustomEdge.vue` 還支援 `data.straight` 直線模式（動作 ↔ 判斷節點間改用 `getStraightPath`）、Yes/No 彩色分支標籤，以及 Element Plus 的 `Delete` 圖示按鈕，完整內容請見原始碼。

#### 在 `JourneyCanvas/index.vue` 註冊與使用自定義邊：

```vue
<script setup>
import CustomEdge from './CustomEdge.vue'
</script>

<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges">
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

> 📌 本專案的 `onConnect`（位於 `JourneyCanvas/index.vue`）會進一步依來源 Handle 套用分支樣式：來自判斷節點 `yes` Handle 的連線標為綠色 `Yes`、`no` Handle 標為紅色 `No`，其餘為灰色 default，並加上 `animated: true`。

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
  <!-- 本專案在 JourneyCanvas/index.vue 內的 <VueFlow> 使用三個外掛 -->
  <VueFlow v-model:nodes="nodes" v-model:edges="edges">
    <Background :gap="20" :size="1" pattern-color="#cbd5e1" />
    <Controls />
    <MiniMap pannable zoomable />
  </VueFlow>
</template>
```

---

## 🧩 專案實作方式

前面是 Vue Flow 的通用概念，這一節說明 **本專案如何把這些概念組裝起來**，幫你建立整體的心智模型。

### 1. 單向資料 pipeline

啟動載入是一條單向流程，集中在 `useJourneyData.ts`：

```
public/data.json
  → loadJourney()             fetch + 驗證（失敗則 throw，呼叫端不致整頁崩潰）
  → toFlowNode / toFlowEdges  API 節點 → Vue Flow node / edge
  → layoutJourney()           dagre 自動排版（在 loadJourney 內部呼叫）
  → App.vue 的 nodes / edges ref
  → <JourneyCanvas>           以 <VueFlow> 渲染
```

`loadJourney()` 回傳 `{ nodes, edges }`，`App.vue` 直接指派給兩個 ref；資料結構（節點 type、config、branches）完整定義於 `docs/api.md`。

### 2. 節點 type 對應

API 的節點型別會收斂成兩種 Vue Flow 自訂節點：

| API type | Vue Flow type | 元件 | 說明 |
|:---|:---|:---|:---|
| `entry` / `wait` / `action` / `end` | `default` | `DefaultNode.vue` | 一般節點，單一輸入 / 輸出 |
| `condition` | `condition` | `ConditionNode.vue` | 判斷節點，具 `yes` / `no` 兩個輸出 Handle |

兩者透過 `<VueFlow>` 的動態插槽 `#node-default` / `#node-condition` 註冊（見 `JourneyCanvas/index.vue`）。

### 3. 自動排版（無座標資料）

`data.json` **不含座標**，位置由 `useJourneyLayout.ts` 用 `@dagrejs/dagre` 以 LR（由左至右）計算。重點：

- dagre 回傳的是節點 **中心點**，需換算成 Vue Flow 的左上角座標。
- 兩段後處理：將 action ↔ condition 之間拉成水平直線、強制 condition 的 **Yes 分支顯示在 No 分支上方**。

### 4. 分支 → Handle / 樣式映射

| API branch | 分支 | sourceHandle | 顏色 |
|:---|:---|:---|:---|
| `'0'` | Yes | `yes` | 綠 `#439e28` |
| `'else'` | No | `no` | 紅 `#f43f5e` |
| `'default'` | 預設 | （單一輸出） | 灰 `#909399` |

使用者手動連線時，`onConnect`（`JourneyCanvas/index.vue`）依來源 Handle 套用同一套配色。

### 5. 所有 Edge 皆為 `deletable`

畫布以 `:default-edge-options="{ type: 'deletable' }"` 讓每條連線都由 `CustomEdge.vue` 渲染（hover 顯示刪除鈕）；`data.straight` 為 true 時改用直線而非平滑階梯線。

### 6. 狀態管理（刻意保持輕量）

`nodes` / `edges` 是 `App.vue` 的 ref，透過 `v-model:nodes` / `v-model:edges` 一路綁到 `<JourneyCanvas>`（以 `defineModel` 透傳）再到 `<VueFlow>`，形成**雙向綁定**——畫布上的拖曳、增刪、undo / redo 都會回寫 ref；節點的 `edit` / `copy` / `delete` 仍透過 emit 回拋。實際的增刪改一律用 `useVueFlow()` 的 `addNodes` / `removeNodes` / `addEdges` 等方法，**不另外引入狀態管理庫**。

> 📌 v-model 會把 Vue Flow 內部的 `GraphNode` / `GraphEdge`（含 `dimensions`、`handleBounds`、`computedPosition` 等內部欄位）回寫進 ref，故 ref 內容比初始的精簡形狀肥很多（對渲染無害）。要乾淨、可序列化的狀態時改用 `useVueFlow()` 的 `toObject()`——工具列的「💾 儲存」按鈕即以此 `console.log` 輸出，預備未來串接 API。

### 7. Composables 職責一覽

| Composable | 職責 |
|:---|:---|
| `useJourneyData.ts` | 載入 `data.json`、驗證、轉成 Vue Flow nodes / edges（內部呼叫排版） |
| `useJourneyLayout.ts` | dagre LR 自動排版與後處理 |
| `useDnD.ts` | 側邊欄拖曳新增節點，`project()` 將螢幕座標轉成畫布座標 |
| `useHistory.ts` | undo / redo，以 `toObject` / `fromObject` 做完整快照（300ms debounce） |
| `useNodeId.ts` | 共用的節點 ID 產生器 `nextNodeId()` |

### 8. 樣式策略

- **元件自身的 DOM** 一律用 Tailwind utility class（寫在 template）。
- **覆寫 Vue Flow 第三方產生的 `.vue-flow__*` DOM** 時，用 **非 scoped** `<style>` + 全域選擇器 + `!important`（scoped 無法穿透第三方 DOM），並以元件根 class（如 `.journey-canvas`）作前綴，使樣式隨元件檔案移動、可獨立移植。

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

### 執行相依（dependencies）

| 套件 | 說明 |
|:---|:---|
| [`@vue-flow/core`](https://vueflow.dev) | Vue Flow 核心庫 |
| [`@vue-flow/background`](https://vueflow.dev) | 背景網格外掛 |
| [`@vue-flow/controls`](https://vueflow.dev) | 縮放控制外掛 |
| [`@vue-flow/minimap`](https://vueflow.dev) | 小地圖外掛 |
| [`@dagrejs/dagre`](https://github.com/dagrejs/dagre) | 自動排版（節點座標計算，由左至右） |
| [`@vueuse/core`](https://vueuse.org) | Vue Composition 工具集 |
| [`@element-plus/icons-vue`](https://element-plus.org/en-US/component/icon.html) | 圖示庫（如連線刪除鈕的 Delete 圖示） |
| [`vue`](https://vuejs.org) | Vue 3 框架 |

### 開發相依（devDependencies）

| 套件 | 說明 |
|:---|:---|
| [`vite`](https://vite.dev) | 建構工具 |
| [`typescript`](https://www.typescriptlang.org) | 型別系統 |
| [`vue-tsc`](https://github.com/vuejs/language-tools) | Vue 型別檢查（`npm run build` 內含） |
| [`tailwindcss`](https://tailwindcss.com) | CSS utility 框架（2.2.17，JIT 模式） |
| [`postcss`](https://postcss.org) | CSS 處理器（啟用 Tailwind） |
| [`autoprefixer`](https://github.com/postcss/autoprefixer) | 自動補上 CSS 廠商前綴 |

---

## 📖 延伸學習

- [Vue Flow 官方文件](https://vueflow.dev)
- [Vue Flow GitHub](https://github.com/bcakmakoglu/vue-flow)
- [Vue Flow 範例集](https://vueflow.dev/examples/)
- [Vue 3 文件](https://vuejs.org)

---

## 📄 授權

MIT License
