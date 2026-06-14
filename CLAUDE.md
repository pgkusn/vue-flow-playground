# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 指令

```bash
npm run dev      # 啟動 Vite 開發伺服器（http://localhost:5173）
npm run build    # vue-tsc -b 型別檢查後再 vite build
npm run preview  # 預覽 production 建構結果
```

本專案無 lint 與測試設定；`npm run build` 內含的 `vue-tsc -b` 是唯一的型別/正確性把關。改完程式後以 `npm run build` 驗證型別。

## 專案性質

Vue Flow 的節點式流程圖編輯器，領域是 **LINE 行銷自動化「旅程」（journey）**：起點觸發後依序經過等待、動作、條件分流，最終結束。畫布初始內容由 `public/data.json` 載入，其資料結構（節點 type、config、branches）完整定義於 `docs/api.md`——修改載入/轉換邏輯前務必先讀該檔。

技術棧：Vue 3 `<script setup>` + TypeScript + Vite 8 + Tailwind CSS 2.2.17（**JIT 模式**）。Tailwind 透過 PostCSS 啟用：`postcss.config.cjs` 載入 `tailwindcss` + `autoprefixer`，設定在 `tailwind.config.cjs`（專案為 ESM，故 config 一律用 `.cjs`）。進入點 `src/style.css` 以 `@tailwind base/components/utilities` 注入，**不是** v4 的 `@import 'tailwindcss'`。

## 資料流與架構

啟動載入是單向 pipeline，集中在 `useJourneyData.ts`：

```
public/data.json
  → loadJourney()           fetch + 驗證，失敗則 throw（呼叫端不致整頁崩潰）
  → toFlowNode/toFlowEdges  API 節點 → Vue Flow node/edge
  → layoutJourney()         dagre 自動排版（見下）
  → App.vue 的 nodes/edges ref
  → <JourneyCanvas>         以 <VueFlow> 渲染
```

關鍵慣例：

- **`data.json` 不含座標**，位置由 `useJourneyLayout.ts` 用 `@dagrejs/dagre` 以 LR（由左至右）自動計算。dagre 回傳中心點，需換算成 Vue Flow 的左上角座標。其中還有兩段後處理：action↔condition 之間拉成水平直線、強制 condition 的 Yes 分支在 No 分支上方。
- **節點 type 對應**：API 的 `entry/wait/action/end` 都映射到 Vue Flow type `'journey'`（`JourneyNode.vue`），只有 `condition` 映射到 `'condition'`（`ConditionNode.vue`，具 yes/no 兩個輸出 Handle）。自訂節點透過 `<VueFlow>` 的動態插槽 `#node-journey` / `#node-condition` 註冊。
- **branch type → Handle/樣式**：`'0'`→ Yes（綠、sourceHandle `yes`）、`'else'`→ No（紅、sourceHandle `no`）、`'default'`→ 灰色單一輸出。`onConnect`（`JourneyCanvas.vue`）在使用者手動連線時套用同一套配色。
- **所有 edge type 皆為 `'deletable'`**，由 `CustomEdge.vue` 渲染（動態插槽 `#edge-deletable`），提供 hover 顯示刪除鈕；`data.straight` 為 true 時改用直線而非平滑階梯線。

State 管理刻意保持輕量：`nodes`/`edges` 是 `App.vue` 的 ref，子元件透過 props 傳入、透過 emit（`edit`/`copy`/`delete`）回拋，實際增刪改用 `useVueFlow()` 的 `addNodes`/`removeNodes` 等方法。

## Composables

- `useHistory.ts` — undo/redo。以 Vue Flow 的 `toObject`/`fromObject` 做完整快照，監聽 `onNodesChange`/`onEdgesChange` 自動記錄（300ms debounce）。套用快照期間用 `applying` 旗標暫停記錄，避免無限迴圈。`init()` 須在畫布就緒後呼叫以建立基準。
- `useDnD.ts` — 側邊欄拖曳新增節點。Sidebar 呼叫 `onDragStart`，canvas wrapper 綁定 `onDragOver`/`onDrop`；`project()` 將螢幕座標轉成畫布座標。

## 樣式慣例（重要）

混用 Tailwind 與少量全域 CSS，規則明確：

1. **元件自身的 DOM 一律用 Tailwind utility class**（寫在 template）。
2. **覆寫 Vue Flow 第三方產生的 `.vue-flow__*` DOM** 時，必須用 **非 scoped** `<style>` + 全域選擇器 + `!important`（scoped 無法穿透第三方 DOM）。這類 CSS 一律以元件根 class（如 `.journey-canvas`）作前綴，**隨元件檔案移動、不依賴全域檔案**。
3. **元件要可獨立移植**：所需的設計變數（如 `--accent-violet`）直接複製進元件根選擇器（見 `JourneyCanvas.vue` 的 `.journey-canvas`），不依賴全域 `:root`。
4. 將全域 CSS 搬進元件時，優先評估改寫成 Tailwind utility，而非原樣搬移；無對應 utility 者（如 `-webkit-text-fill-color`、`:first-child` 結構選擇器）才保留 CSS。
5. **2.2.17 的限制（重要）**：JIT 支援 `[...]` arbitrary value，但僅限**單 token** 值（如 `text-[15px]`、`bg-[#d4d7de]`、`z-[999]`）；**多 token 值空格須用逗號、不可用底線**，且 gradient／box-shadow／font 堆疊等複雜值不可靠 → 一律改原生 CSS（見 `App.vue` 的 `.app-header__logo`、`.modal-overlay`，`JourneyCanvas.vue` 的 `.journey-canvas--dragover`）。另有 v3+ 才有、2.2.17 沒有的 utility 須替換：`shrink-0`→`flex-shrink-0`、`slate` 調色盤→arbitrary hex、`cursor-grab`／`backdrop-blur`／`active:scale` 等→原生 CSS。`@apply` 可用（含 arbitrary value 與變體）；v4 的 `@reference` 不需要。

## OpenSpec 工作流程

本專案採 spec-driven 開發，規格在 `openspec/specs/`（目前有 `journey-canvas`、`journey-node-palette`），變更提案在 `openspec/changes/`。透過 `/opsx:*` skills（propose / apply / verify / archive / explore）搭配 `openspec` CLI 操作。新增功能前先看對應 spec.md 的 Requirements/Scenario。
