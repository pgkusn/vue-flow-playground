## Context

現有畫布以 `src/initial-elements.ts` 寫死一組「資料處理管線」節點（category: input/process/output/data/condition），並由 `App.vue` 直接帶入 `VueFlow`。節點元件 `CustomNode.vue`、`ConditionNode.vue`、連線 `CustomEdge.vue` 與 `Sidebar.vue` 的內容均以該示範為基礎。

實際需求是呈現「行銷自動化旅程」：資料來源為 `public/data.json`，欄位語意定義於 `docs/api.md`，外觀依 Pencil 設計稿 `pencil-new.pen`。`data.json` 僅含節點與 `branches`（連線關係），不含座標，因此需要在前端自動計算版面。Vue Flow（`@vue-flow/core` 1.48）已可使用，並已安裝 background / controls / minimap 外掛。

節點類型與分支規則（取自 `docs/api.md`）：
- 類型：`entry`、`wait`、`action`、`condition`、`end`
- `branches.*.type`：單線為 `default`；判斷節點分流為 `0`（rules 成立）與 `else`（皆不符合）
- `branches.*.targetNodeId`：指向下一節點的 `id`

## Goals / Non-Goals

**Goals:**
- 以 `public/data.json` 為資料來源，依 `docs/api.md` 規格轉換為 Vue Flow nodes/edges 並渲染。
- 自動由左至右配置版面，分支垂直分散、不重疊。
- 依設計稿重做五種節點卡片、Handle 配置、節點 hover 動作列、連線樣式與 hover 刪除互動。
- 重做左側節點面板（動作／判斷／等待／結束），移除頁籤；起點不入側邊欄。
- 頂部導覽列背景改白；節點設定彈窗清空、白底。
- 完成後以瀏覽器驗證。

**Non-Goals:**
- 不實作節點設定彈窗的實際表單與儲存邏輯（僅留白）。
- 不變更頂部導覽列的內容（僅改背景色）。
- 不實作旅程設定／節點設定頁籤功能。
- 不處理 `data.json` 寫回 / API 串接（POST/PUT）。

## Decisions

### 決策 1：以執行階段 `fetch('/data.json')` 載入
在 `App.vue` 的 `onMounted`（或專用 composable）以 `fetch('/data.json')` 取得資料後轉換並設定 `nodes`/`edges`。
- 理由：`data.json` 位於 `public/`，Vite 會原樣serve 於根路徑 `/data.json`，符合「可被替換的外部資料」語意，亦貼近未來改為打 API 的情境。
- 替代方案：以 `import` 靜態打包 JSON——較簡單但把資料當成程式碼的一部分，與情境不符。

### 決策 2：新增 `composables/useJourneyData.ts` 負責轉換
集中處理「API 節點 → Vue Flow 節點/連線」的對應，輸出 `nodes`、`edges`。
- 節點：`{ id, type: 類型對應, position, data: { type, title, description, raw } }`。`type` 對應 Vue Flow 自訂節點：`condition` → `condition`，其餘 → `journey`（一般卡片）。
- 連線：展開每個節點的 `branches`，以 `targetNodeId` 建立 edge；`sourceHandle` 由 `branch.type` 決定（`0`/`else` 對應判斷節點兩個 handle，`default` 不指定或用單一 handle）。所有 edge `animated: true`、`type: 'deletable'`。
- 重點訊息（description）：由各類型 `config` 摘要產生（如 wait→「等待 N 分鐘」、action→動作摘要、condition→conditionType），design 不逐欄定義，apply 階段依 api.md 實作合理摘要。

### 決策 3：自動版面採用 `@dagrejs/dagre`（rankdir LR）
以 dagre 計算有向圖的左至右分層座標。
- 理由：旅程是 DAG，含分支與合流（多個節點可指向同一 end）；dagre 能穩定處理分層與避免重疊，省去手刻演算法。
- 替代方案：自訂 BFS depth → x、同層 index → y。實作簡單但分支/合流時容易重疊，維護成本高。若不想新增相依，可作為退路。
- 風險控管：dagre 為純計算、無 DOM 相依，體積小；若安裝受限則回退自訂 BFS。

### 決策 4：節點元件整併為 `JourneyNode` 與 `ConditionNode`
沿用現有 `#node-<type>` slot 機制。重做 `CustomNode.vue`（更名語意為一般旅程節點）與 `ConditionNode.vue`：
- 卡片：白底、圓角、細邊框；左側彩色 icon 方塊（依類型配色：entry/action 藍、condition 紅、wait 橘、end 灰）；標題可換行、重點訊息單行截斷；min-width 140px、max-width 280px。
- Handle：以 props/類型控制顯示——entry 僅 source、end 僅 target、condition 一 target + 兩 source（綠 top=0、紅 bottom=else）、其餘一 target 一 source。
- hover 動作列：沿用既有 `edit`/`copy`/`delete` emit 與 `App.vue` handler；外觀依設計稿（按鈕浮於卡片上方、可各別 hover）。

### 決策 5：連線元件 `CustomEdge` 加入 hover 刪除 icon
edge hover 時於中段顯示刪除 icon，預設 20px、hover 24px，點擊刪除。配色依 branch：`default` 灰、`0` 綠（標 Yes）、`else` 紅（標 No）。
- 沿用 `type: 'deletable'` 既有機制。

### 決策 6：側邊欄與導覽列
- `Sidebar.vue` 改為動作／判斷／等待／結束四項；`useDnD` 的 drop 依拖曳類型建立對應 Vue Flow 節點。移除頁籤、操作說明可保留或精簡。
- 導覽列：僅調整 `style.css` 中 header 背景為白色（必要時調整文字色以維持對比），內容不動。
- 設定彈窗：移除既有表單欄位，保留彈窗外框、白底、空內容。

## Risks / Trade-offs

- [新增 `@dagrejs/dagre` 相依] → 體積小且純計算；若環境無法安裝則回退自訂 BFS 版面。
- [data.json 的 `config` 形態多變（如 end 的 `config` 可能為 `[]`）] → 轉換時對缺漏／非物件欄位做防呆，重點訊息以保守摘要呈現。
- [hover 動作列與連線刪除 icon 的點擊區與 Vue Flow 的拖曳/選取互動衝突] → 以 `@click.stop` 與適當 `pointer-events` 隔離，瀏覽器實測驗證。
- [導覽列改白底可能與既有深色文字/按鈕對比不足] → 改色時一併檢查對比，必要時微調文字色（但不改內容）。
- [自動版面與設計稿座標不會完全一致] → 設計稿為外觀基準、非絕對座標；以「清楚、不重疊、左至右」為驗收標準。

## Migration Plan

1. 新增 `useJourneyData.ts` 與版面工具，先讓畫布能由 `data.json` 渲染（可暫用舊節點外觀驗證資料正確）。
2. 重做節點/連線/側邊欄外觀與互動。
3. 調整導覽列背景與清空設定彈窗。
4. 移除或淨空 `initial-elements.ts` 的舊示範資料。
5. 瀏覽器驗證後完成。
- 回退：本變更為前端呈現層，保留 git 還原即可回退；無資料遷移。

## Open Questions

- 重點訊息（description）對每種 `config` 的精確摘要文案，於 apply 階段依 `docs/api.md` 決定（如 condition 顯示 conditionType 或 targets 摘要）。
- 是否保留側邊欄的「操作說明／快捷鍵」區塊（預設精簡保留，不影響需求）。
