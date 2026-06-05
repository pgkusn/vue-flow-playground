<script setup lang="ts">
/**
 * Sidebar 元件
 * 提供可拖曳的節點項目列表，用於拖放到畫布上新增節點
 */

const nodeTypes = [
  {
    type: 'input',
    icon: '📥',
    name: '輸入節點',
    desc: '流程起始點',
    iconClass: 'sidebar__node-icon--input',
  },
  {
    type: 'process',
    icon: '⚙️',
    name: '處理節點',
    desc: '資料處理與轉換',
    iconClass: 'sidebar__node-icon--default',
  },
  {
    type: 'output',
    icon: '📤',
    name: '輸出節點',
    desc: '流程結束點',
    iconClass: 'sidebar__node-icon--output',
  },
  {
    type: 'data',
    icon: '💾',
    name: '資料節點',
    desc: '儲存與快取',
    iconClass: 'sidebar__node-icon--custom',
  },
  {
    type: 'condition',
    icon: '🔀',
    name: '條件節點',
    desc: '分支與判斷',
    iconClass: 'sidebar__node-icon--condition',
  },
]

/**
 * 拖曳開始事件
 * 將節點類型資訊附加到 dataTransfer
 */
function onDragStart(event: DragEvent, nodeType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <aside class="sidebar">
    <!-- 節點面板 -->
    <div class="sidebar__section">
      <div class="sidebar__section-title">拖曳節點到畫布</div>

      <div
        v-for="node in nodeTypes"
        :key="node.type"
        class="sidebar__node-item"
        :draggable="true"
        @dragstart="onDragStart($event, node.type)"
      >
        <div :class="['sidebar__node-icon', node.iconClass]">
          {{ node.icon }}
        </div>
        <div class="sidebar__node-info">
          <div class="sidebar__node-name">{{ node.name }}</div>
          <div class="sidebar__node-desc">{{ node.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 使用說明 -->
    <div class="sidebar__section">
      <div class="sidebar__section-title">操作說明</div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.7;">
        <p>🖱️ <strong>拖曳節點</strong> — 從左側拖入畫布</p>
        <p>🔗 <strong>建立連線</strong> — 拖曳節點上的圓點</p>
        <p>🗑️ <strong>刪除</strong> — 選取後按 Backspace</p>
        <p>🔍 <strong>縮放</strong> — 滑鼠滾輪</p>
        <p>✋ <strong>平移</strong> — 拖曳空白區域</p>
      </div>
    </div>

    <!-- 快捷鍵 -->
    <div class="sidebar__section">
      <div class="sidebar__section-title">快捷鍵</div>
      <div style="font-size: 11px; color: var(--text-muted); line-height: 2;">
        <div style="display: flex; justify-content: space-between;">
          <span>全選</span>
          <kbd style="font-family: var(--font-mono); background: var(--bg-surface); padding: 1px 6px; border-radius: 3px;">⌘ A</kbd>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>刪除</span>
          <kbd style="font-family: var(--font-mono); background: var(--bg-surface); padding: 1px 6px; border-radius: 3px;">⌫</kbd>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>適配畫面</span>
          <kbd style="font-family: var(--font-mono); background: var(--bg-surface); padding: 1px 6px; border-radius: 3px;">⌘ F</kbd>
        </div>
      </div>
    </div>
  </aside>
</template>
