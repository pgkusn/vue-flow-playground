# journey-node-palette Specification

## Purpose

定義左側節點面板的內容與行為，包含可拖曳新增至畫布的節點類型清單、起點節點的排除規則，以及面板頁籤的移除。

## Requirements

### Requirement: 可拖曳節點面板內容
左側面板 SHALL 呈現可拖曳到畫布的節點類型清單，包含動作節點、判斷節點、等待節點、結束四種；每個項目 SHALL 顯示對應的彩色 icon 與名稱。

#### Scenario: 顯示四種節點類型
- **WHEN** 檢視左側面板
- **THEN** 面板 SHALL 列出動作節點、判斷節點、等待節點、結束四個可拖曳項目

#### Scenario: 拖曳新增節點
- **WHEN** 使用者將面板中的節點項目拖放至畫布
- **THEN** 系統 SHALL 在放置位置新增一個對應類型的節點

### Requirement: 起點節點不出現於側邊欄
起點節點 SHALL 固定顯示於畫布中，且 SHALL NOT 出現在左側面板的可拖曳清單中。

#### Scenario: 側邊欄不含起點
- **WHEN** 檢視左側面板
- **THEN** 清單中 SHALL NOT 包含起點（entry）節點項目

### Requirement: 移除旅程設定與節點設定頁籤
左側面板 SHALL NOT 包含最左側的「旅程設定」與「節點設定」頁籤功能。

#### Scenario: 無頁籤
- **WHEN** 檢視左側面板區域
- **THEN** 畫面 SHALL NOT 顯示「旅程設定」與「節點設定」頁籤
