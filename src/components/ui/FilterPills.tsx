/** 横向 Pill 筛选（TapTV 分类等） */
interface FilterPillsProps<T extends string> {
  options: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function FilterPills<T extends string>({ options, active, onChange, className = '' }: FilterPillsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`page-pill ui-clickable whitespace-nowrap px-3.5 py-1.5 text-sm transition ${
            active === opt.id ? 'page-pill--active' : 'page-pill--idle'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
