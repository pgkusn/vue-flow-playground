import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@vue-flow/core'
import type { JourneyEdgeData } from './useJourneyData'

/** 節點估計尺寸（供 dagre 計算間距用） */
const NODE_WIDTH = 180
const NODE_HEIGHT = 64
/** 判斷節點較高，容納上下兩個輸出 handle */
const CONDITION_HEIGHT = 84

/**
 * 自動版面配置：以 @dagrejs/dagre 由左至右（LR）排列。
 *
 * data.json 不含座標，改以 dagre 依連線關係計算分層與位置；
 * dagre 回傳的是節點「中心點」座標，需轉成 Vue Flow 使用的左上角座標。
 *
 * 為純計算、無 DOM 相依；回傳套用座標後的新節點陣列。
 */
export function layoutJourney(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120 })
  g.setDefaultEdgeLabel(() => ({}))

  const sizeOf = (node: Node) => ({
    width: NODE_WIDTH,
    height: node.type === 'condition' ? CONDITION_HEIGHT : NODE_HEIGHT,
  })

  for (const node of nodes) {
    g.setNode(node.id, sizeOf(node))
  }

  const idSet = new Set(nodes.map(n => n.id))
  for (const edge of edges) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) continue
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const positioned = nodes.map(node => {
    const { x, y } = g.node(node.id)
    const { width, height } = sizeOf(node)
    return {
      ...node,
      // dagre 回傳中心點，換算成左上角
      position: { x: x - width / 2, y: y - height / 2 },
    }
  })

  const byId = new Map(positioned.map(n => [n.id, n]))

  // 動作節點與判斷節點之間需為水平直線：兩種卡片實際 DOM 高度相同、handle 置中，
  // 故直接將判斷節點頂端對齊動作節點頂端即可使左右 handle 等高、連線水平
  for (const edge of edges) {
    if (!(edge.data as JourneyEdgeData | undefined)?.straight) continue
    const src = byId.get(edge.source)
    const tgt = byId.get(edge.target)
    if (!src || !tgt) continue
    const [anchor, mover] = src.type === 'condition' ? [tgt, src] : [src, tgt]
    mover.position.y = anchor.position.y
  }

  // dagre 的同層排序不保證 Yes/No 方向，這裡強制 Yes 分支目標位於 No 分支目標上方
  for (const node of positioned) {
    if (node.type !== 'condition') continue
    const yesTarget = edges.find(e => e.source === node.id && e.sourceHandle === 'yes')?.target
    const noTarget = edges.find(e => e.source === node.id && e.sourceHandle === 'no')?.target
    const yesNode = yesTarget ? byId.get(yesTarget) : undefined
    const noNode = noTarget ? byId.get(noTarget) : undefined
    if (yesNode && noNode && yesNode.position.y > noNode.position.y) {
      const y = yesNode.position.y
      yesNode.position.y = noNode.position.y
      noNode.position.y = y
    }
  }

  return positioned
}
