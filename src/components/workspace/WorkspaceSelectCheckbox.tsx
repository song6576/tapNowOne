/** 工作空间多选复选框 */
type Props = {
  checked: boolean
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WorkspaceSelectCheckbox({ checked }: Props) {
  return (
    <span className={`workspace-select-checkbox ${checked ? 'workspace-select-checkbox--checked' : ''}`} aria-hidden>
      {checked && <CheckIcon />}
    </span>
  )
}
