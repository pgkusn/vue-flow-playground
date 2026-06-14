import type { Node, Edge } from '@vue-flow/core'
import { layoutJourney } from './useJourneyLayout'

/** 旅程節點類型（取自 docs/api.md） */
export type JourneyNodeType = 'entry' | 'wait' | 'action' | 'condition' | 'end'

interface JourneyBranch {
  type: string
  targetNodeId: string
}

interface JourneyApiNode {
  id: string
  title: string
  type: JourneyNodeType
  config: unknown
  branches: JourneyBranch[]
}

interface JourneyData {
  nodes: JourneyApiNode[]
}

export interface JourneyNodeData {
  type: JourneyNodeType
  title: string
  /** 重點訊息（單行摘要） */
  description: string
  /** 原始 config，保留供未來編輯使用 */
  raw: unknown
}

/** 分支樣式（取自設計稿）：default 灰、0 綠（Yes）、else 紅（No） */
const BRANCH_STROKE = {
  default: '#909399',
  yes: '#439e28',
  no: '#f43f5e',
}

/** 節點摘要文字。目前一律回傳固定字串，日後再依 config 產生真正摘要 */
const summarize = (): string => {
  return '重點訊息'
}

/** API 節點 → Vue Flow 節點 */
const toFlowNode = (node: JourneyApiNode): Node<JourneyNodeData> => {
  return {
    id: node.id,
    type: node.type === 'condition' ? 'condition' : 'default',
    position: { x: 0, y: 0 },
    data: {
      type: node.type,
      title: node.title ?? '',
      description: summarize(),
      raw: node.config,
    },
  }
}

/** API branches → Vue Flow edges */
const toFlowEdges = (node: JourneyApiNode): Edge[] => {
  const branches = Array.isArray(node.branches) ? node.branches : []
  return branches.map(branch => {
    const isYes = branch.type === '0'
    const isNo = branch.type === 'else'
    const stroke = isYes ? BRANCH_STROKE.yes : isNo ? BRANCH_STROKE.no : BRANCH_STROKE.default
    const sourceHandle = isYes ? 'yes' : isNo ? 'no' : undefined
    const label = isYes ? 'Yes' : isNo ? 'No' : undefined

    const edge: Edge = {
      id: `e-${node.id}-${branch.type}-${branch.targetNodeId}`,
      source: node.id,
      target: branch.targetNodeId,
      type: 'deletable',
      animated: true,
      style: { stroke },
    }
    if (sourceHandle) edge.sourceHandle = sourceHandle
    if (label) edge.label = label
    return edge
  })
}

export interface LoadJourneyResult {
  nodes: Node<JourneyNodeData>[]
  edges: Edge[]
}

/**
 * 載入並轉換 public/data.json 為 Vue Flow 的 nodes / edges。
 * 載入或解析失敗時 throw，由呼叫端處理（顯示 toast、不致整頁崩潰）。
 */
export const loadJourney = async (): Promise<LoadJourneyResult> => {
  const res = await fetch('/data.json')
  if (!res.ok) throw new Error(`載入 data.json 失敗：HTTP ${res.status}`)

  const data = (await res.json()) as JourneyData
  if (!data || !Array.isArray(data.nodes)) throw new Error('data.json 格式不正確：缺少 nodes 陣列')

  const flowNodes = data.nodes.map(toFlowNode)
  const flowEdges = data.nodes.flatMap(toFlowEdges)
  const positioned = layoutJourney(flowNodes, flowEdges) as Node<JourneyNodeData>[]

  return { nodes: positioned, edges: flowEdges }
}
