/** 画布底部任务条：生成任务进度 */
import type { GenerationTask } from '../../types/task'

interface TaskBarProps {
  tasks: GenerationTask[]
  onTaskClick?: (task: GenerationTask) => void
}

const TYPE_ICON: Record<string, string> = {
  image: '🖼', video: '🎬', audio: '🔊', text: 'T',
}

export function TaskBar({ tasks, onTaskClick }: TaskBarProps) {
  if (!tasks.length) return null

  return (
    <footer
      className="flex h-[var(--tn-taskbar-h)] shrink-0 items-center gap-2 border-t border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] px-3"
    >
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[var(--tn-text-muted)]">
        History
      </span>
      <div className="flex flex-1 gap-2 overflow-x-auto py-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskClick?.(task)}
            className="group flex shrink-0 items-center gap-2 rounded-lg border border-[var(--tn-border-subtle)] bg-[var(--tn-bg-panel)] px-2 py-1.5 transition-colors hover:border-[var(--tn-border)]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm"
              style={{ background: task.thumbnail ?? 'var(--tn-bg-hover)' }}
            >
              {task.status === 'generating' ? (
                <span className="animate-pulse text-[var(--tn-node-video)]">⏳</span>
              ) : (
                TYPE_ICON[task.type] ?? '•'
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-[var(--tn-text-secondary)] group-hover:text-white">
                {task.label}
              </p>
              <p className="text-[10px] text-[var(--tn-text-muted)]">{task.status}</p>
            </div>
          </button>
        ))}
      </div>
    </footer>
  )
}
