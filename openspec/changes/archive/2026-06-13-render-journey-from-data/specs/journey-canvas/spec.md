## ADDED Requirements

### Requirement: 從 data.json 載入旅程資料
系統 SHALL 在應用程式啟動時讀取 `public/data.json`，並依 `docs/api.md` 的節點規格將其轉換為 Vue Flow 的 nodes 與 edges，作為畫布的初始內容，取代原本寫死的資料處理管線範例。

#### Scenario: 啟動時成功載入並渲染
- **WHEN** 應用程式載入完成且 `data.json` 取得成功
- **THEN** 畫布 SHALL 依 `nodes` 陣列渲染出對應數量的節點，並依各節點 `branches` 渲染出對應的連線

#### Scenario: 資料載入失敗
- **WHEN** `data.json` 讀取失敗或格式不正確
- **THEN** 系統 SHALL 不致整頁崩潰，並以提示（toast）告知載入失敗

### Requirement: 節點類型轉換
系統 SHALL 依節點的 `type` 欄位（`entry`、`wait`、`action`、`condition`、`end`）轉換為對應的 Vue Flow 節點類型與外觀，節點的 `title` 作為顯示標題、`id` 作為節點識別碼。

#### Scenario: 五種類型對應正確外觀
- **WHEN** 轉換一個節點
- **THEN** `entry`/`action`/`wait`/`end` SHALL 使用一般節點外觀、`condition` SHALL 使用具有兩個輸出分支的判斷節點外觀，且各類型顯示其對應的彩色 icon

### Requirement: 連線（branches）轉換
系統 SHALL 依每個節點 `branches` 陣列中的 `targetNodeId` 建立由該節點指向目標節點的連線，並依 `branches.*.type` 決定連線來源 Handle 與樣式。

#### Scenario: 預設連線
- **WHEN** `branch.type` 為 `default`
- **THEN** 系統 SHALL 建立一條灰色連線，來源為節點的單一輸出 Handle

#### Scenario: 判斷節點分支連線
- **WHEN** `branch.type` 為 `0`（成立）或 `else`（不成立）
- **THEN** 系統 SHALL 由判斷節點對應的輸出 Handle 建立連線，`0` 為綠色並標示 Yes、`else` 為紅色並標示 No

#### Scenario: 結束節點無輸出
- **WHEN** 節點 `type` 為 `end` 且 `branches` 為空陣列
- **THEN** 該節點 SHALL 不產生任何輸出連線

### Requirement: 所有連線具動畫效果
系統 SHALL 將所有連線設定為 `animated: true`。

#### Scenario: 連線動畫
- **WHEN** 任何連線被渲染（初始載入或使用者新建）
- **THEN** 該連線 SHALL 呈現流動動畫

### Requirement: 自動版面配置
因 `data.json` 不含節點座標，系統 SHALL 依節點之間的連線關係自動計算由左至右的版面位置，使流程清楚呈現且節點不重疊。

#### Scenario: 由起點向右展開
- **WHEN** 計算版面
- **THEN** 起點節點 SHALL 位於最左側，後續節點依連線深度向右排列

#### Scenario: 分支節點垂直分散
- **WHEN** 判斷節點有兩條分支指向不同節點
- **THEN** 兩個下游節點 SHALL 在垂直方向上分散排列而不重疊

### Requirement: 節點卡片外觀
節點卡片 SHALL 呈現左側彩色 icon、可換行的標題（節點名稱）、以及單行且超出截斷的重點訊息；節點最小寬度 SHALL 為 140px、最大寬度 SHALL 為 280px。

#### Scenario: 標題換行與訊息截斷
- **WHEN** 標題文字較長
- **THEN** 標題 SHALL 換行顯示，而重點訊息 SHALL 維持單行並以省略號截斷超出的內容

### Requirement: 節點 Handle 配置
系統 SHALL 依節點類型配置連線 Handle：起點節點僅有輸出 Handle、結束節點僅有輸入 Handle、判斷節點具一個輸入 Handle 與兩個輸出 Handle（對應 `0`/`else`），其餘節點具一個輸入與一個輸出 Handle。

#### Scenario: 起點僅可連出
- **WHEN** 檢視起點節點
- **THEN** 該節點 SHALL 只提供輸出 Handle，無法作為連線目標

#### Scenario: 判斷節點兩輸出
- **WHEN** 檢視判斷節點
- **THEN** 該節點 SHALL 提供兩個可區分的輸出 Handle，分別對應綠色（Yes/0）與紅色（No/else）分支

### Requirement: 節點 hover 動作列
當滑鼠移入節點時，系統 SHALL 顯示三顆動作按鈕：設定（開啟編輯彈窗）、複製（複製含設定內容的節點）、刪除（移除節點）；按鈕 SHALL 可各別 hover 並提供視覺回饋。

#### Scenario: hover 顯示動作按鈕
- **WHEN** 滑鼠移入節點
- **THEN** 系統 SHALL 顯示設定／複製／刪除三顆按鈕

#### Scenario: 點擊設定開啟彈窗
- **WHEN** 使用者點擊設定按鈕
- **THEN** 系統 SHALL 開啟節點設定彈窗

#### Scenario: 複製與刪除
- **WHEN** 使用者點擊複製或刪除按鈕
- **THEN** 系統 SHALL 分別複製該節點（含設定內容）或移除該節點及其相關連線

### Requirement: 連線 hover 刪除互動
當滑鼠移入連線時，系統 SHALL 於連線中段顯示刪除 icon；該 icon 預設尺寸 SHALL 為 20px，於 hover 時放大為 24px；點擊後刪除該連線。

#### Scenario: hover 連線顯示刪除 icon
- **WHEN** 滑鼠移入一條連線
- **THEN** 系統 SHALL 在連線中段顯示刪除 icon

#### Scenario: 點擊刪除連線
- **WHEN** 使用者點擊連線上的刪除 icon
- **THEN** 系統 SHALL 移除該連線

### Requirement: 節點設定彈窗留空
此階段節點設定彈窗 SHALL 顯示為空內容且背景為白色，不實作任何設定欄位與儲存邏輯。

#### Scenario: 開啟空白彈窗
- **WHEN** 使用者開啟節點設定彈窗
- **THEN** 彈窗 SHALL 呈現白色背景且內容區為空

### Requirement: 頂部導覽列背景改為白色
頂部導覽列的內容 SHALL 維持不變，僅將其背景改為白色。

#### Scenario: 導覽列白底
- **WHEN** 檢視頂部導覽列
- **THEN** 導覽列背景 SHALL 為白色，且原有的標題與按鈕內容不變
