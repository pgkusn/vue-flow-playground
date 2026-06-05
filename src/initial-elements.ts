import type { Node, Edge } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'

/**
 * 初始節點資料
 * 展示一個資料處理工作流程的範例
 */
export const initialNodes: Node[] = [
  // 輸入節點
  {
    id: 'input-1',
    type: 'custom',
    label: '資料來源',
    position: { x: 50, y: 80 },
    data: {
      category: 'input',
      icon: '📥',
      title: '資料輸入',
      description: '從 API 取得原始資料',
      status: '運行中',
    },
  },
  {
    id: 'input-2',
    type: 'custom',
    label: '使用者輸入',
    position: { x: 50, y: 300 },
    data: {
      category: 'input',
      icon: '👤',
      title: '使用者設定',
      description: '過濾條件與參數',
      status: '已就緒',
    },
  },

  // 處理節點
  {
    id: 'process-1',
    type: 'custom',
    label: '資料清洗',
    position: { x: 350, y: 40 },
    data: {
      category: 'process',
      icon: '🔄',
      title: '資料清洗',
      description: '去除空值與重複資料',
      status: '運行中',
    },
  },
  {
    id: 'process-2',
    type: 'custom',
    label: '資料轉換',
    position: { x: 350, y: 220 },
    data: {
      category: 'process',
      icon: '⚙️',
      title: '資料轉換',
      description: '格式化與結構轉換',
      status: '等待中',
    },
  },
  {
    id: 'process-3',
    type: 'custom',
    label: '合併資料',
    position: { x: 350, y: 400 },
    data: {
      category: 'process',
      icon: '🔗',
      title: '合併處理',
      description: '多來源資料合併',
      status: '等待中',
    },
  },

  // 資料節點
  {
    id: 'data-1',
    type: 'custom',
    label: '暫存快取',
    position: { x: 650, y: 130 },
    data: {
      category: 'data',
      icon: '💾',
      title: '快取儲存',
      description: 'Redis 快取層',
      status: '運行中',
    },
  },

  // 條件分支節點
  {
    id: 'condition-1',
    type: 'condition',
    label: '資料驗證',
    position: { x: 950, y: 130 },
    data: {
      category: 'condition',
      icon: '🔀',
      title: '資料驗證',
      description: '資料筆數 > 0',
      condition: 'data.length > 0',
      status: '運行中',
    },
  },

  // 輸出節點
  {
    id: 'output-1',
    type: 'custom',
    label: '資料庫',
    position: { x: 1280, y: 40 },
    data: {
      category: 'output',
      icon: '🗄️',
      title: '寫入資料庫',
      description: 'PostgreSQL 持久化儲存',
      status: '已就緒',
    },
  },
  {
    id: 'output-2',
    type: 'custom',
    label: '通知',
    position: { x: 1280, y: 280 },
    data: {
      category: 'output',
      icon: '📨',
      title: '發送通知',
      description: 'Email & Webhook 通知',
      status: '已就緒',
    },
  },
]

/**
 * 初始邊（連線）資料
 */
export const initialEdges: Edge[] = [
  // 輸入 → 處理
  {
    id: 'e-input1-process1',
    source: 'input-1',
    target: 'process-1',
    type: 'deletable',
    animated: true,
    style: { stroke: '#34d399' },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e-input1-process2',
    source: 'input-1',
    target: 'process-2',
    type: 'deletable',
    animated: true,
    style: { stroke: '#34d399' },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e-input2-process3',
    source: 'input-2',
    target: 'process-3',
    type: 'deletable',
    style: { stroke: '#34d399' },
    markerEnd: MarkerType.ArrowClosed,
  },

  // 處理 → 資料
  {
    id: 'e-process1-data1',
    source: 'process-1',
    target: 'data-1',
    type: 'deletable',
    animated: true,
    style: { stroke: '#818cf8' },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e-process2-data1',
    source: 'process-2',
    target: 'data-1',
    type: 'deletable',
    style: { stroke: '#818cf8' },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e-process3-output2',
    source: 'process-3',
    target: 'output-2',
    type: 'deletable',
    style: { stroke: '#818cf8' },
    markerEnd: MarkerType.ArrowClosed,
  },

  // 資料 → 條件分支
  {
    id: 'e-data1-condition1',
    source: 'data-1',
    target: 'condition-1',
    type: 'deletable',
    animated: true,
    style: { stroke: '#fbbf24' },
    markerEnd: MarkerType.ArrowClosed,
  },

  // 條件分支 → 輸出 (Yes: 寫入資料庫)
  {
    id: 'e-condition1-output1',
    source: 'condition-1',
    sourceHandle: 'yes',
    target: 'output-1',
    type: 'deletable',
    animated: true,
    label: '✓ Yes',
    style: { stroke: '#34d399' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#34d399',
    },
  },

  // 條件分支 → 輸出 (No: 發送通知)
  {
    id: 'e-condition1-output2',
    source: 'condition-1',
    sourceHandle: 'no',
    target: 'output-2',
    type: 'deletable',
    label: '✗ No',
    style: { stroke: '#fb7185' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#fb7185',
    },
  },
]

