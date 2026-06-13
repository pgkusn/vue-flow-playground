# API

| **功能** | **Method** | **URL 路由** | Request | Response |
| --- | --- | --- | --- | --- |
| **新增行銷旅程** | `POST` | `/api/bot/{botGuid}/Marketing` | 參考下方
API request body | 參考下方
API response body |
| **更新行銷旅程** | `PUT` | `/api/bot/{botGuid}/Marketing/{journeyId}` | 參考下方
API request body | 參考下方
API response body |
| **取得設定資料** | `GET` | `/api/bot/{botGuid}/Marketing/{journeyId}` | 參考下方
API request body | 參考下方
API response body |

API 欄位說明

旅程設定欄位
這組欄位位於 JSON 的最外層，定義了這條自動化行銷旅程的基本資訊與限制。

| **欄位名稱** | **型態** | **必填** | **說明** | **範例值** |
| --- | --- | --- | --- | --- |
| `title` | String | 是 | 旅程的名稱（行銷活動名稱），上限 30 字元。 | `"2026雙十一新客回購旅程"` |
| `startAt` | String (DateTime) | 是 | 旅程的**發布/生效時間**。早於此時間旅程不執行。 | `"2026-11-01 00:00:00"` |
| `endAt` | String (DateTime) | 是 | 旅程的**停用/結束時間**。必須大於或等於 `startAt`。 | `"2026-11-12 23:59:59"` |
| `status` | String | 是 | 旅程的狀態。目前限制只能為 `draft`（草稿）或 `active`（啟用）。 | `"active"` |
| `settings` | Object | 是 | 旅程的進階行為安全限制容器。 | `{}` |
| `settings.maxParticipationPerUser` | Integer | 是 | **每位用戶最大重複參與次數**（防重複轟炸防呆）。 | `1` |
| `settings.participationIntervalHours` | Integer | 是 | **重複參與的間隔小時**。用戶離開後需隔多久才能再進旅程。 | `24` |
| `settings.maxTotalMessages` | Integer | 是 | **此旅程允許發送的訊息總數上限**（預算/流量控管）。 | `100000` |
| `nodes` | Array | 是 | 畫布上所有**節點物件**的集合陣列。 | 參考節點欄位 |

節點欄位

位於 nodes.* 內，不論什麼類型的節點（起點、等待、條件、行動、結束）都必須具備的基本欄位。

| **欄位名稱** | **型態** | **必填** | **說明** | **範例值** |
| --- | --- | --- | --- | --- |
| `nodes.*.id` | String | 是 | 節點的唯一識別碼（前端前端前端發明或 UUID），連線指向時使用。 | `"node_wait_001"` |
| `nodes.*.title` | String | 是 | 節點在畫布畫面上顯示的自訂標題。 | `"等待15分鐘"` |
| `nodes.*.type` | String | 是 | 節點分類。列舉值：`entry`, `wait`, `action`, `condition`, `end`。 | `"wait"` |
| `nodes.*.config` | Object | 是 | 節點的**核心設定**，依 `type` 不同而有內部互斥欄位（見下表）。 | 參考下面節點類別 |
| `nodes.*.branches` | Array | 是 | 節點的**連線設定**。定義此節點後續往哪裡連。 | `[...]` |
| `nodes.*.branches.*.type` | String | 是 | 連線插槽的類型名稱。單線傳輸為 `default`；分流則為 `0`, `1`, `else` 等。 | `"default"` |
| `nodes.*.branches.*.targetNodeId` | String | 是 | 這條連線指向的**下一顆節點的 ID**（指向其它節點的 `id`）。 | `"node_action_002"` |

起點節點欄位`entry`

當 `type = "entry"` 時啟用。負責定義「誰、在什麼時候」要進入這條旅程。

| **欄位名稱** | **型態** | **必填條件** | **說明** |
| --- | --- | --- | --- |
| `config.entryType` | String | 是 | 起點觸發模式。可選：`schedule`（定期起點）或 `trigger`（觸發起點）。 |
| **【模式 A：Trigger 專用】** |  |  |  |
| `config.trigger` | Object | `entryType=trigger` | 觸發事件容器。 |
| `config.trigger.type` | String | `entryType=trigger` | 監聽事件種類。可選：`tag`（被貼標籤時）或 `role`（被更改身份時）。 |
| `config.trigger.guids` | Array[String] | `entryType=trigger` | 目標標籤或身份的 GUID 清單。只要符合其中一個就立刻發動。 |
| **【模式 B：Schedule 專用】** |  |  |  |
| `config.conditions` | Object | `entryType=schedule` | 計算型標籤篩選器容器（包含時間排程與標籤群組）。 |
| `config.conditions.schedule` | Object | `entryType=schedule` | 計時排程設定物件。 |
| `config.conditions.schedule.frequency` | String | `entryType=schedule` | 執行頻率。可選：`daily`（每天）、`weekly`（每週）、`monthly`（每月）。 |
| `config.conditions.schedule.config` | Object | `entryType=schedule` | 時間配置細節容器。 |
| `config.conditions.schedule.config.time` | String | `entryType=schedule` | 具體執行時間，格式固定為 $24$ 小時制 `H:i`（例如 `"09:30"`）。 |
| `config.conditions.schedule.config.dayOfMonth` | Integer | `frequency=monthly` | 每月第幾天執行（限制 1~31）。 |
| `config.conditions.schedule.config.dayOfWeek` | Integer | `frequency=weekly` | 每週星期幾執行（限制 0~6，0 為週日）。 |
| `config.conditions.groups` | Array | `entryType=schedule` | 等於計算型標籤條件設定組件groups，定義條件。 |

動作節點欄位`action`

當 `type = "action"` 時啟用。負責對用戶主動派發動作（如發送 LINE 訊息）。

| **欄位名稱** | **型態** | **必填** | **說明** |
| --- | --- | --- | --- |
| `config.actions` | Array | 是 | 等於動作設定組件的actions，定義要執行的動作 |

等待節點欄位`wait`

當 `type = "wait"` 時啟用。負責卡住用戶，時間到才放行至下一關。

| **欄位名稱** | **型態** | **必填條件** | **說明** |
| --- | --- | --- | --- |
| `config.waitType` | String | 是 | 等待模式。可選：`duration`（停留一段時間）或 `specificTime`（卡到指定時間點）。 |
| `config.minutes` | Integer | `waitType=duration` | **等待的分鐘數**。必須正整數。 |
| `config.time` | String | `waitType=specificTime` | **當日指定放行時間點**。格式固定為 `H:i`（例如 `"18:00"`）。 |

結束節點欄位`end`

當 `type = "end"` 時啟用。代表旅程在此終止。

| **欄位名稱** | **型態** | **必填** | **說明** |
| --- | --- | --- | --- |
| `config` | Object | 是 | 空物件{} |

判斷節點欄位`condition`

當 `type = "condition"` 時啟用。依據用戶當前的屬性狀態，進行**多向或二分法條件分流**。

| **欄位名稱** | **型態** | **必填** | **說明** |
| --- | --- | --- | --- |
| `config.conditionType` | String | 是 | 檢查的屬性維度分類。例如：`hasTag`（標籤狀態）、`hasRole`（角色權限）、`hasMember`（會員資格）。 |
| `config.targets` | Array[String] | 是 | 要檢查的目標 GUID 陣列or其他資訊，目前限制為1個或0個 |
| `config.rules` | Array | 是 | 條件判斷式陣列。其**陣列索引 (Index)** 會對應 `branches` 的連線 `type`。 |
| `config.rules.*.operator` | String | 是 | 邏輯運算子。例如：`and`,`or`,`not`。 |
| `config.rules.*.value` | Mixed | 否 | 運算子對應的值。在檢查標籤狀態（`and`/`or`/`not`）時，目前都是 `null`；
若未來做次數比對時可傳數字或區間陣列。(保留未來擴充用) |

- API request body 結構說明
    
    ```json
    {
      "title": "2026年 雙十一電商新客自動化行銷旅程",
      "startAt": "2026-11-01 00:00:00",
      "endAt": "2026-11-12 23:59:59",
      "status": "active",// active,draft
      "settings": {
        "maxParticipationPerUser": 1,
        "participationIntervalHours": 24,
        "maxTotalMessages": 100000
      },
      "nodes": [{參考節點物件}]
    }
    ```
    

節點物件

- 起點節點
    - 定期schedule
        
        ```jsonc
        {
        	"id":"abc123",//前端產生 nodeId 用 uuid
          "type": "ENTRY",
          "config": {
            "entryType": "schedule",
            "conditions": {
              "schedule": {//同計算型標籤條件組件 array
                "frequency": "weekly",
                "config": {
                  "time": "14:30",
                  "dayOfMonth": null,
                  "dayOfWeek": 3
                }
              },
              "groups": [//同計算型標籤條件組件 array
                {
                  "botGuid": "bot_guid_example",
                  "operator": "OR",
                  "conditions": [
                    {
                      "type": "richmenu",
                      "guid": "menu_guid_example"
                    }
                  ]
                }
              ],
              "operatorBetweenGroups": []//同計算型標籤條件組件 array
            }
          },
          "branches": [
            {
              "type": "default",//default:預設類別直接前往下一個節點
              "targetNodeId": "node_wait_001"//下一個節點id
            }
          ]
        }
        ```
        
    - 觸發trigger
        
        ```jsonc
        {
          "id": "node_entry_trigger_tag",//前端產生 nodeId 用 uuid
          "title": "即時觸發：好友被貼上【2026購物節_有意願買】標籤",
          "type": "entry",
          "config": {
            "entryType": "trigger",
            "trigger": {
              "type": "tag",
              "guids": [
                "tag_guid_shopping_festival_2026",
                "tag_guid_intersted_user"
              ]
            }
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_wait_001"
            }
          ]
        }
        ```
        
- 等待節點
    - 延遲duration
        
        ```jsonc
        {
          "id": "node_wait_002",//前端產生 nodeId 用 uuid
          "title": "等待：固定延遲 30 分鐘",
          "type": "wait",
          "config": {
            "waitType": "duration",
            "minutes": 30
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_end_001"
            }
          ]
        },
        ```
        
    - 指定時間specificTime
        
        ```json
        {
          "id": "node_wait_001",
          "title": "等待：直到當天下午 14:00 放行",
          "type": "wait",
          "config": {
            "waitType": "specificTime",
            "time": "14:00"
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_condition_001"
            }
          ]
        }
        ```
        
- 動作節點
    
    ```jsonc
    {
      "id": "node_action_vip_msg",
      "title": "發送：VIP 專屬多圖推播與優惠券",
      "type": "action",
      "config": {
        "actions": [//同動作設定組件的 actions array
          {
            "type": "sendMessages",
            "params": {
              "from": "messages",
              "type": "keyword",
              "messages": [
                {
                  "text": "安安你好",
                  "type": "text"
                }
              ]
            }
          },
          {
            "type": "addTags",
            "params": {
              "sync": true,
              "fromId": 2696,
              "tagIds": [
                3948
              ],
              "fromTypeId": 3
            }
          }
        ]
      },
      "branches": [
        {
          "type": "default",
          "targetNodeId": "node_wait_002"
        }
      ]
    }
    ```
    
- 結束節點
    
    ```json
    {
      "id": "node_end_001",
      "title": "結束旅程",
      "type": "end",
      "config": {},
      "branches": []
    }
    ```
    
- 判斷節點
    - 標籤:身上是否有某標籤
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "type": "condition",
          "config": {
            "conditionType": "hasTag",
            "targets": [
              "tagGuid1"
            ],
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",//對應 config.rules 這個 array 的 index
              "targetNodeId": "node_A"
            },
            {
              "type": "else",//對應 config.rules 都不符合的話
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 身份:身上是否有某身份
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "type": "condition",
          "config": {
            "conditionType": "hasRole",
            "targets": [
              "roleGuid1"
            ],
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",//對應 config.rules 這個 array 的 index
              "targetNodeId": "node_A"
            },
            {
              "type": "else",//對應 config.rules 都不符合的話
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 會員:是否為會員
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "type": "condition",
          "config": {
            "conditionType": "hasMember",
            "targets": [],
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 是會員
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 不是會員
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 生日:當月生日、當天生日
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "type": "condition",
          "config": {
            "conditionType": "birthday",
            "targets": ["currentMonth"],//currentMonth,currentDay
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 是當月生日|當天生日
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 不是當月生日|當天生日
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 身份狀態異動:
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "title": "判斷：是否成功「升級」至黃金會員",
          "type": "condition",
          "config": {
            "conditionType": "roleChanged",
            "targets": ["roleGuid"],
            "rules": [
              {
                "operator": "and",
                "value": "upgrade" //upgrade,downgrade,renew
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 有升級|降級|續會
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 沒有升級|降級|續會
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 票券領取判斷:
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "title": "判斷：是否已領取雙11週年慶優惠券",
          "type": "condition",
          "config": {
            "conditionType": "giftedCoupon",
            "targets": [// 如果全選就 couponGuid 全送
            "couponGuid1", 
            "couponGuid2", 
            "couponGuid3"
            ],
            "rules": [
              {
                "operator": "or",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 有領券
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 沒有領券
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 票券|遊戲獎項核銷判斷:
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "title": "判斷：是否已核銷雙11週年慶優惠券",
          "type": "condition",
          "config": {
            "conditionType": "verifiedCoupon",
            "targets": [// 如果全選就 couponGuid 全送
            "couponGuid1", 
            "couponGuid2", 
            "couponGuid3"
            ],
            "rules": [
              {
                "operator": "or",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 有核銷
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 沒有核銷
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 是否已遊玩遊戲判斷:
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "title": "判斷：是否遊玩雙11週年慶遊戲",
          "type": "condition",
          "config": {
            "conditionType": "playedGame",
            "targets": ["gameGuid1"],//只有一個
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 有玩
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 沒有玩
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
    - 是否已讀群發訊息判斷:
        
        ```jsonc
        {
          "id": "uuid",//前端產生nodeId uuid
          "title": "判斷：是否已讀雙11週年慶群發訊息",
          "type": "condition",
          "config": {
            "conditionType": "readScheduleMessage",
            "targets": ["scheduleGuid"],//只有一個
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",// 有玩
              "targetNodeId": "node_A"
            },
            {
              "type": "else",// 沒有玩
              "targetNodeId": "node_B"
            }
          ]
        }
        ```
        
- API request body 範例
    
    ```json
    {
      "title": "雙十一電商新客自動化行銷旅程",
      "startAt": "2026-11-01 00:00:00",
      "endAt": "2026-11-12 23:59:59",
      "status": "active",
      "settings": {
        "maxParticipationPerUser": 1,
        "participationIntervalHours": 24,
        "maxTotalMessages": 100000
      },
      "nodes": [
        {
          "id": "node_entry_001",
          "title": "排程發動：",
          "type": "entry",
          "config": {
            "entryType": "schedule",
            "conditions": {
              "schedule": {
                "config": {
                  "time": "10:00",
                  "dayOfMonth": 5
                },
                "frequency": "monthly",
                "isEnabled": true
              },
              "groups": [
                {
                  "botGuid": "testing_bot_guid",
                  "operator": 4,
                  "conditions": [
                    {
                      "guid": "SLmqfKIqsL",
                      "type": "richmenu",
                      "operator": 1
                    }
                  ]
                }
              ],
              "operatorBetweenGroups": []
            }
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_wait_001"
            }
          ]
        },
        {
          "id": "node_wait_001",
          "title": "等待：直到當天下午 14:00 放行",
          "type": "wait",
          "config": {
            "waitType": "specificTime",
            "time": "14:00"
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_condition_001"
            }
          ]
        },
        {
          "id": "node_condition_001",
          "title": "檢查：用戶是否擁有 VIP 或 尊榮標籤",
          "type": "condition",
          "config": {
            "conditionType": "hasTag",
            "targets": [
              "tag_guid_vip",
              "tag_guid_premium"
            ],
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "branches": [
            {
              "type": "0",
              "targetNodeId": "node_action_vip_msg"
            },
            {
              "type": "else",
              "targetNodeId": "node_action_normal_msg"
            }
          ]
        },
        {
          "id": "node_action_vip_msg",
          "title": "發送：VIP 專屬多圖推播與優惠券",
          "type": "action",
          "config": {
            "actions": [
              {
                "type": "sendMessages",
                "params": {
                  "from": "messages",
                  "messages": [
                    {
                      "text": "安安你好",
                      "type": "text"
                    }
                  ]
                }
              },
              {
                "type": "addTags",
                "params": {
                  "sync": true,
                  "fromTypeId": 44,
                  "tagIds": [
                    3948
                  ]
                }
              }
            ]
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_wait_002"
            }
          ]
        },
        {
          "id": "node_action_normal_msg",
          "title": "發送：一般用戶新客推播",
          "type": "action",
          "config": {
            "actions": [
              {
                "type": "sendMessages",
                "params": {
                  "from": "messages",
                  "messages": [
                    {
                      "text": "安安你好",
                      "type": "text"
                    }
                  ]
                }
              },
              {
                "type": "addTags",
                "params": {
                  "sync": true,
                  "fromTypeId": 44,
                  "tagIds": [
                    3948
                  ]
                }
              }
            ]
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_end_001"
            }
          ]
        },
        {
          "id": "node_wait_002",
          "title": "等待：固定延遲 30 分鐘",
          "type": "wait",
          "config": {
            "waitType": "duration",
            "minutes": 30
          },
          "branches": [
            {
              "type": "default",
              "targetNodeId": "node_end_001"
            }
          ]
        },
        {
          "id": "node_end_001",
          "title": "結束旅程",
          "type": "end",
          "config": [],
          "branches": []
        }
      ]
    }
    ```
    
- API response body 範例
    
    ```json
    {
      "id": "6a2bbc8ec719c76c050d5bb2",
      "title": "雙十一電商新客自動化行銷旅程",
      "startAt": "2026-11-01 00:00:00",
      "endAt": "2026-11-12 23:59:59",
      "status": "active",
      "settings": {
        "maxParticipationPerUser": 1,
        "participationIntervalHours": 24,
        "maxTotalMessages": 100000
      },
      "nodes": [
        {
          "id": "6a2bbc8ec719c76c050d5bb3",
          "branches": [
            {
              "type": "default",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb4"
            }
          ],
          "config": {
            "entryType": "schedule",
            "conditions": {
              "groups": [
                {
                  "botGuid": "testing_bot_guid",
                  "operator": 4,
                  "conditions": [
                    {
                      "guid": "NtLdycxG65",
                      "type": "richmenu",
                      "operator": 1
                    }
                  ]
                }
              ],
              "schedule": {
                "config": {
                  "time": "10:00",
                  "dayOfMonth": 5
                },
                "frequency": "monthly",
                "isEnabled": true
              },
              "operatorBetweenGroups": []
            }
          },
          "title": "排程發動：",
          "type": "entry"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb4",
          "branches": [
            {
              "type": "default",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb5"
            }
          ],
          "config": {
            "waitType": "specificTime",
            "time": "14:00"
          },
          "title": "等待：直到當天下午 14:00 放行",
          "type": "wait"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb5",
          "branches": [
            {
              "type": "0",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb6"
            },
            {
              "type": "else",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb7"
            }
          ],
          "config": {
            "conditionType": "hasTag",
            "targets": [
              "tag_guid_vip",
              "tag_guid_premium"
            ],
            "rules": [
              {
                "operator": "and",
                "value": null
              }
            ]
          },
          "title": "檢查：用戶是否擁有 VIP 或 尊榮標籤",
          "type": "condition"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb6",
          "branches": [
            {
              "type": "default",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb8"
            }
          ],
          "config": {
            "flowId": 1,
            "actions": [
              {
                "type": "sendMessages",
                "params": {
                  "from": "messages",
                  "type": "marketing",
                  "messages": [
                    {
                      "text": "安安你好",
                      "type": "text"
                    }
                  ]
                }
              },
              {
                "type": "addTags",
                "params": {
                  "sync": true,
                  "fromId": -1,
                  "tagIds": [
                    3948
                  ],
                  "fromTypeId": 1
                }
              }
            ]
          },
          "title": "發送：VIP 專屬多圖推播與優惠券",
          "type": "action"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb7",
          "branches": [
            {
              "type": "default",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb9"
            }
          ],
          "config": {
            "flowId": 2,
            "actions": [
              {
                "type": "sendMessages",
                "params": {
                  "from": "messages",
                  "type": "marketing",
                  "messages": [
                    {
                      "text": "安安你好",
                      "type": "text"
                    }
                  ]
                }
              },
              {
                "type": "addTags",
                "params": {
                  "sync": true,
                  "fromId": -1,
                  "tagIds": [
                    3948
                  ],
                  "fromTypeId": 1
                }
              }
            ]
          },
          "title": "發送：一般用戶新客推播",
          "type": "action"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb8",
          "branches": [
            {
              "type": "default",
              "targetNodeId": "6a2bbc8ec719c76c050d5bb9"
            }
          ],
          "config": {
            "waitType": "duration",
            "minutes": 30
          },
          "title": "等待：固定延遲 30 分鐘",
          "type": "wait"
        },
        {
          "id": "6a2bbc8ec719c76c050d5bb9",
          "branches": [],
          "config": [],
          "title": "結束旅程",
          "type": "end"
        }
      ]
    }
    ```