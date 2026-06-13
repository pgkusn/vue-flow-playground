## Why

目前的左側面板與畫布區域是一個通用的「資料處理管線」示範（輸入／處理／輸出／資料／條件），與專案實際要呈現的「行銷自動化旅程」無關。我們需要依照 Pencil 設計稿與 `docs/api.md` 的資料結構，將 `public/data.json` 的旅程資料轉換成 Vue Flow 所需的節點與連線格式，並套用設計稿的外觀，讓畫面真正反映行銷旅程編輯器。

## What Changes

- **重寫畫布初始資料來源**：移除寫死的 `initial-elements.ts` 資料處理管線範例，改為在啟動時讀取 `public/data.json`，依 `docs/api.md` 的節點規格轉換成 Vue Flow 的 nodes / edges。
- **新增資料轉換邏輯**：依 `type`（`entry`/`wait`/`action`/`condition`/`end`）建立對應節點；依每個節點的 `branches`（`default`/`0`/`else`）建立連線；因 data.json 無座標，需自動計算由左至右的版面位置。
- **重做節點卡片外觀**：依設計稿呈現五種節點類型的卡片（彩色 icon + 標題可換行 + 重點訊息單行截斷、min-w 140px／max-w 280px），並依類型配置 Handle（起點僅輸出、結束僅輸入、判斷節點兩個輸出 handle 對應 Yes/else）。
- **節點 hover 動作列**：滑鼠移入節點時顯示 ⚙️（開啟設定彈窗）／📋（複製節點含設定）／🗑️（刪除節點）三顆按鈕，按鈕可各別 hover。
- **連線樣式與互動**：所有連線 `animated: true`；`default` 灰色、判斷節點 `0` 綠色標示 Yes、`else` 紅色標示 No；hover 連線時於中段顯示刪除 icon（預設 20px、hover 放大為 24px）。
- **重做左側節點面板**：側邊欄改為可拖曳的節點類型清單（動作節點、判斷節點、等待節點、結束），移除最左側「旅程設定」與「節點設定」頁籤；起點節點固定顯示於畫布、不出現在側邊欄。
- **頂部導覽列背景改白**：導覽列內容維持不變，僅將背景改為白色。
- **編輯彈窗清空**：節點設定彈窗內容留空、背景改為白色，此階段不實作其功能。

## Capabilities

### New Capabilities
- `journey-canvas`: 讀取並轉換 `public/data.json` 為 Vue Flow 節點與連線、自動版面配置、五種節點卡片外觀與 Handle、節點 hover 動作列、連線樣式與 hover 刪除互動、清空的設定彈窗。
- `journey-node-palette`: 左側可拖曳節點面板的內容與外觀（動作／判斷／等待／結束），以及移除頁籤、起點不入側邊欄等規則。

### Modified Capabilities
<!-- 無既有 spec，故不適用 -->

## Impact

- **程式碼**：`src/App.vue`、`src/components/Sidebar.vue`、`src/components/CustomNode.vue`、`src/components/ConditionNode.vue`、`src/components/CustomEdge.vue`、`src/initial-elements.ts`、`src/style.css`；新增資料轉換與自動版面配置模組（如 `src/composables/useJourneyData.ts`、layout 工具）。
- **資料來源**：執行階段以 `fetch('/data.json')` 讀取 `public/data.json`；欄位語意以 `docs/api.md` 為準。
- **相依套件**：自動版面可能新增 layout 套件（如 `@dagrejs/dagre`），或以自訂演算法實作（design 階段決定）。
- **測試**：完成後以瀏覽器驗證節點／連線渲染、hover 動作、連線刪除與整體外觀。
