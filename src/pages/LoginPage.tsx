import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-indigo-400">◉ TapFlow</span>
          <p className="mt-2 text-sm text-slate-500">Agentic Creative Canvas</p>
        </div>

        <div className="mb-6 flex rounded-lg bg-[#0a0a0f] p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-1.5 text-sm ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md py-1.5 text-sm ${mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">昵称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                placeholder="你的名字"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-slate-400">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">密码</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
              placeholder="至少 6 位"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/canvas" className="text-xs text-slate-500 hover:text-indigo-400">
            暂不登录，本地模式使用 →
          </Link>
        </div>
      </div>
    </div>
  )
}
