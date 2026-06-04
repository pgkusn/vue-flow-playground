import type { Node, Edge } from '@vue-flow/core'

/**
 * 簡易版的初始節點資料
 * 展示 Vue Flow 最基礎的三種內建節點類型：input, default, output
 */
export const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'input',
    label: '輸入節點 (Input Node)',
    position: { x: 150, y: 150 },
  },
  {
    id: 'node-2',
    // 預設類型 (default)
    label: '預設處理節點 (Default Node)',
    position: { x: 400, y: 150 },
  },
  {
    id: 'node-3',
    type: 'output',
    label: '輸出節點 (Output Node)',
    position: { x: 650, y: 150 },
  },
]

/**
 * 簡易版的初始邊（連線）資料
 */
export const initialEdges: Edge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true, // 動態流動效果
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
  },
]
