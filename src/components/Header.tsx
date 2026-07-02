/** 旧版画布 Header：导入导出、云端保存 */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCanvasStore } from '../store/canvasStore'
import { useAuthStore } from '../store/authStore'
import { exportProject, importProject } from '../utils/storage'
import { checkHealth, type HealthStatus } from '../api/client'

function BackendBadge() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => setError(true))
  }, [])

  if (error) return <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] text-red-400">后端离线</span>
  if (!health) return <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">连接中...</span>
  if (health.mock_mode || !health.dashscope_configured) {
    return <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] text-amber-400">Mock 模式</span>
  }
  return <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-400">AI 已就绪</span>
}

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const project = useCanvasStore((s) => s.project)
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const setProjectName = useCanvasStore((s) => s.setProjectName)
  const loadProjectToStore = useCanvasStore((s) => s.loadProject)
  const persist = useCanvasStore((s) => s.persist)
  const saveToCloud = useCanvasStore((s) => s.saveToCloud)
  const exportVideo = useCanvasStore((s) => s.exportVideo)
  const exporting = useCanvasStore((s) => s.exporting)
  const fileRef = useRef<HTMLInputElement>(null)
  const [cloudSaving, setCloudSaving] = useState(false)

  const handleExportJson = () => exportProject({ ...project, nodes, edges })

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      loadProjectToStore(await importProject(file))
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败')
    }
    e.target.value = ''
  }

  const handleCloudSave = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setCloudSaving(true)
    try {
      await saveToCloud()
    } catch (err) {
      alert(err instanceof Error ? err.message : '云端保存失败')
    } finally {
      setCloudSaving(false)
    }
  }

  const handleExportVideo = async () => {
    try {
      const url = await exportVideo()
      window.open(url, '_blank')
    } catch (err) {
      alert(err instanceof Error ? err.message : '视频导出失败')
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#1e1e2e] bg-[#12121a] px-4">
      <Link to={user ? '/' : '/canvas'} className="flex items-center gap-2 hover:opacity-80">
        <span className="text-lg font-bold text-indigo-400">◉</span>
        <span className="font-semibold text-slate-100">TapFlow</span>
      </Link>

      <input
        type="text"
        value={project.name}
        onChange={(e) => setProjectName(e.target.value)}
        className="rounded-md border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-1 text-sm text-slate-200 outline-none focus:border-indigo-500"
        placeholder="项目名称"
      />

      <div className="ml-auto flex items-center gap-2">
        <BackendBadge />

        {user && (
          <span className="hidden text-[10px] text-slate-500 sm:inline">{user.name}</span>
        )}

        <button
          type="button"
          disabled={exporting}
          onClick={handleExportVideo}
          className="rounded-md border border-[#1e1e2e] px-3 py-1 text-xs text-slate-300 hover:bg-[#1a1a28] disabled:opacity-50"
        >
          {exporting ? '合成中...' : '🎬 导出视频'}
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-md border border-[#1e1e2e] px-3 py-1 text-xs text-slate-300 hover:bg-[#1a1a28]"
        >
          导入
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <button
          type="button"
          onClick={handleExportJson}
          className="rounded-md border border-[#1e1e2e] px-3 py-1 text-xs text-slate-300 hover:bg-[#1a1a28]"
        >
          导出 JSON
        </button>

        <button
          type="button"
          onClick={persist}
          className="rounded-md border border-[#1e1e2e] px-3 py-1 text-xs text-slate-300 hover:bg-[#1a1a28]"
        >
          本地保存
        </button>

        <button
          type="button"
          disabled={cloudSaving}
          onClick={handleCloudSave}
          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {cloudSaving ? '保存中...' : '☁ 云端保存'}
        </button>

        {user ? (
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:text-red-400"
          >
            退出
          </button>
        ) : (
          <Link to="/login" className="rounded-md px-2 py-1 text-xs text-indigo-400 hover:underline">
            登录
          </Link>
        )}
      </div>
    </header>
  )
}
