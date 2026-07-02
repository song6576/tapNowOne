/** 工作空间筛选：类型（全部/文件夹/项目）+ 排序 */
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../store/langStore'
import type { WorkspaceSortBy, WorkspaceSortOrder, WorkspaceTypeFilter } from '../../store/workspaceStore'

export interface WorkspaceFilterState {
  typeFilter: WorkspaceTypeFilter
  sortBy: WorkspaceSortBy
  sortOrder: WorkspaceSortOrder
}

interface WorkspaceFilterDropdownProps {
  value: WorkspaceFilterState
  onChange: (value: WorkspaceFilterState) => void
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/70">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WorkspaceFilterDropdown({ value, onChange }: WorkspaceFilterDropdownProps) {
  const { t } = useI18n()
  const f = t.workspace.filter
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const label =
    value.typeFilter === 'folders'
      ? f.foldersOnly
      : value.typeFilter === 'projects'
        ? f.projectsOnly
        : t.workspace.showAll

  const setType = (typeFilter: WorkspaceTypeFilter) => onChange({ ...value, typeFilter })
  const setSortBy = (sortBy: WorkspaceSortBy) => onChange({ ...value, sortBy })
  const setSortOrder = (sortOrder: WorkspaceSortOrder) => onChange({ ...value, sortOrder })

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="workspace-filter-btn ui-clickable" onClick={() => setOpen(!open)}>
        {label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="workspace-filter-menu ui-glass-panel absolute right-0 top-full z-20 mt-2 min-w-[200px] py-2">
          <p className="px-4 py-1.5 text-xs text-white/35">{f.filterSection}</p>
          {([
            ['all', f.showAll],
            ['folders', f.foldersOnly],
            ['projects', f.projectsOnly],
          ] as const).map(([id, text]) => (
            <button
              key={id}
              type="button"
              className="ui-clickable flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white/85 hover:bg-white/5"
              onClick={() => { setType(id); setOpen(false) }}
            >
              {text}
              {value.typeFilter === id && <CheckIcon />}
            </button>
          ))}
          <div className="my-1 border-t border-white/[0.06]" />
          <p className="px-4 py-1.5 text-xs text-white/35">{f.sortSection}</p>
          {([
            ['updatedAt', f.sortUpdated],
            ['createdAt', f.sortCreated],
          ] as const).map(([id, text]) => (
            <button
              key={id}
              type="button"
              className="ui-clickable flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white/85 hover:bg-white/5"
              onClick={() => setSortBy(id)}
            >
              {text}
              {value.sortBy === id && <CheckIcon />}
            </button>
          ))}
          <div className="my-1 border-t border-white/[0.06]" />
          <p className="px-4 py-1.5 text-xs text-white/35">{f.orderSection}</p>
          {([
            ['desc', f.newestFirst],
            ['asc', f.oldestFirst],
          ] as const).map(([id, text]) => (
            <button
              key={id}
              type="button"
              className="ui-clickable flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white/85 hover:bg-white/5"
              onClick={() => setSortOrder(id)}
            >
              {text}
              {value.sortOrder === id && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
