interface TabBarProps<T extends string> {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function TabBar<T extends string>({ tabs, active, onChange, className = '' }: TabBarProps<T>) {
  return (
    <div className={`page-tab-bar flex items-center gap-6 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`page-tab ui-clickable pb-3 text-sm transition ${
            active === tab.id ? 'page-tab--active text-white' : 'text-white/45 hover:text-white/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
