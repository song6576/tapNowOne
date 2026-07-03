/** 画布节点默认摆放：工具栏新增错开，右键/双击按光标落点 */
export const NODE_PLACE_OFFSET = { x: 100, y: 90 }

const COLS = 3
const COL_GAP = 320
const ROW_GAP = 220
const ORIGIN = { x: 160, y: 140 }

/** 工具栏等无坐标场景：按已有节点数量网格错开 */
export function nextToolbarNodePosition(count: number): { x: number; y: number } {
  const col = count % COLS
  const row = Math.floor(count / COLS)
  return {
    x: ORIGIN.x + col * COL_GAP,
    y: ORIGIN.y + row * ROW_GAP,
  }
}

/** 右键/双击菜单：节点中心对齐光标 */
export function nodePositionAtCursor(flow: { x: number; y: number }): { x: number; y: number } {
  return {
    x: flow.x - NODE_PLACE_OFFSET.x,
    y: flow.y - NODE_PLACE_OFFSET.y,
  }
}
