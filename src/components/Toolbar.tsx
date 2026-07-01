import type { NodeType } from '../types'
import { NODE_META } from '../types'
import { useCanvasStore } from '../store/canvasStore'

const NODE_TYPES: NodeType[] = ['text', 'image', 'video', 'audio']

export function Toolbar() {
  const addNode = useCanvasStore((s) => s.addNode)
  const applyStoryboard = useCanvasStore((s) => s.applyStoryboard)

  const loadDemo = () => {
    const script = '清晨，一杯咖啡在木桌上冒着热气。阳光透过窗户洒在桌面。镜头缓缓推近咖啡杯。'
    applyStoryboard(
      [
        { label: '分镜1', prompt: '清晨木桌上的咖啡，热气袅袅，暖色调' },
        { label: '分镜2', prompt: '阳光透过窗户洒在桌面，光影斑驳' },
        { label: '分镜3', prompt: '镜头推近咖啡杯，特写，电影感' },
      ],
      script,
    )
  }

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-[#1e1e2e] bg-[#12121a] py-4">
      {NODE_TYPES.map((type) => {
        const meta = NODE_META[type]
        return (
          <button
            key={type}
            type="button"
            title={`添加${meta.label}节点`}
            onClick={() => addNode(type)}
            className="group flex w-12 flex-col items-center gap-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#1a1a28] hover:text-slate-200"
          >
            <span className="text-xl">{meta.icon}</span>
            <span className="text-[10px]">{meta.label}</span>
          </button>
        )
      })}

      <div className="my-2 w-8 border-t border-[#1e1e2e]" />

      <button
        type="button"
        title="加载示例工作流"
        onClick={loadDemo}
        className="flex w-12 flex-col items-center gap-1 rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#1a1a28] hover:text-amber-400"
      >
        <span className="text-lg">⚡</span>
        <span className="text-[9px]">示例</span>
      </button>

      <div className="mt-auto px-2 text-center text-[9px] leading-tight text-slate-600">
        点击添加节点
      </div>
    </aside>
  )
}
