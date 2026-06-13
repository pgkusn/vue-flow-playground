/** 全應用共用的節點 ID 產生器，避免多處各自計數造成 ID 重複 */
let nodeId = 100

/** 產生下一個唯一節點 ID */
export function nextNodeId(): string {
  return `node-${++nodeId}`
}
