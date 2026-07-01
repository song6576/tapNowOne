import { useState } from 'react'
import { PropertyPanel } from './PropertyPanel'
import { AgentChat } from './AgentChat'

type Tab = 'props' | 'agent'

export function RightPanel() {
  const [tab, setTab] = useState<Tab>('props')

  return (
    <aside
      className="flex shrink-0 flex-col border-l border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)]"
      style={{ width: 'var(--tn-panel-w)' }}
    >
      <div className="flex border-b border-[var(--tn-border-subtle)]">
        {(['props', 'agent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-white text-white'
                : 'text-[var(--tn-text-muted)] hover:text-[var(--tn-text-secondary)]'
            }`}
          >
            {t === 'props' ? 'Inspector' : 'Agent'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === 'props' ? <PropertyPanel embedded /> : <AgentChat />}
      </div>
    </aside>
  )
}
