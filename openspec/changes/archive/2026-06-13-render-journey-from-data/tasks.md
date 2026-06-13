## 1. 資料載入與轉換

- [x] 1.1 新增 `src/composables/useJourneyData.ts`，以 `fetch('/data.json')` 載入旅程資料，並處理載入失敗（不崩潰、回傳可辨識的錯誤狀態）
- [x] 1.2 實作節點轉換：依 `type`（entry/wait/action/condition/end）對應 Vue Flow 節點類型，帶入 `id`、`title`，並保留原始 `config` 於 `data.raw`
- [x] 1.3 實作各類型「重點訊息」摘要（依 `docs/api.md`：wait→等待時間、action→動作摘要、condition→conditionType/targets、entry→觸發/排程、end→結束）
- [x] 1.4 實作連線轉換：展開每個節點 `branches`，依 `targetNodeId` 建立 edge，依 `branch.type`（default/0/else）決定 sourceHandle、顏色與 Yes/No 標籤，且全部 `animated: true`、`type: 'deletable'`
- [x] 1.5 在 `App.vue` 啟動時呼叫轉換並設定 `nodes`/`edges`，移除對舊 `initial-elements.ts` 範例的依賴

## 2. 自動版面配置

- [x] 2.1 新增版面工具（優先使用 `@dagrejs/dagre`，rankdir=LR；若無法安裝則回退自訂 BFS 分層）計算節點座標
- [x] 2.2 套用座標到節點，確認起點在最左、分支垂直分散且節點不重疊，載入後自動 `fitView`

## 3. 節點卡片與 Handle

- [x] 3.1 重做一般旅程節點元件（白底圓角卡片、左側彩色 icon、標題可換行、重點訊息單行截斷、min-w 140px/max-w 280px）
- [x] 3.2 依類型配置 Handle：entry 僅 source、end 僅 target、其餘一 target 一 source
- [x] 3.3 重做判斷節點 `ConditionNode.vue`：一 target + 兩 source（綠 top=0/Yes、紅 bottom=else/No），套用設計稿外觀
- [x] 3.4 實作節點 hover 動作列（⚙️設定／📋複製／🗑️刪除，浮於卡片上方、可各別 hover），沿用既有 edit/copy/delete 事件

## 4. 連線樣式與互動

- [x] 4.1 重做 `CustomEdge.vue`：default 灰、0 綠（標 Yes）、else 紅（標 No），hover 連線時於中段顯示刪除 icon（預設 20px、hover 24px），點擊刪除連線
- [x] 4.2 確認新建連線（onConnect）沿用上述樣式規則與 `animated: true`

## 5. 側邊欄與導覽列

- [x] 5.1 重做 `Sidebar.vue`：列出動作／判斷／等待／結束四種可拖曳節點（含彩色 icon 與名稱），移除「旅程設定」「節點設定」頁籤
- [x] 5.2 更新 `useDnD`，使拖放依類型建立對應的 Vue Flow 節點；確認起點不出現在側邊欄
- [x] 5.3 將頂部導覽列背景改為白色（內容不變，必要時調整文字對比）

## 6. 設定彈窗與清理

- [x] 6.1 清空節點設定彈窗內容、背景改白色，移除既有表單欄位與儲存邏輯（保留彈窗外框）
- [x] 6.2 移除或淨空 `initial-elements.ts` 中不再使用的範例資料，清理相關 import

## 7. 驗證

- [x] 7.1 啟動 dev server，於瀏覽器驗證 `data.json` 的節點與連線正確渲染、版面清楚不重疊
- [x] 7.2 驗證 hover 動作列、連線 hover 刪除、判斷節點 Yes/No 分支配色與標籤、所有連線動畫
- [x] 7.3 驗證側邊欄拖曳新增節點、導覽列白底、設定彈窗留白；確認無 console 錯誤與型別檢查通過
