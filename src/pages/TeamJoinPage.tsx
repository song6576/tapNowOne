/** 通过邀请链接加入团队 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptTeamInvite, previewTeamInvite } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useI18n } from '../store/langStore'
import { useTeamStore } from '../store/teamStore'
import { useToastStore } from '../store/toastStore'
import { useWorkspaceStore } from '../store/workspaceStore'

export function TeamJoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const v = t.accountViews.teamSettings.join
  const user = useAuthStore((s) => s.user)
  const initTeam = useTeamStore((s) => s.init)
  const switchTeam = useTeamStore((s) => s.switchTeam)
  const showToast = useToastStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewTeamInvite>> | null>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    void previewTeamInvite(token)
      .then(setPreview)
      .catch(() => setPreview({ valid: false, reason: 'not_found', team_name: null, member_count: 0, expires_at: null, unlimited_quota: false }))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = () => {
    if (!token || !preview?.valid) return
    setAccepting(true)
    void acceptTeamInvite(token)
      .then(async (res) => {
        setJoined(true)
        if (user?.name) await initTeam(user.name)
        await switchTeam(res.team_id)
        await useWorkspaceStore.getState().setScope(res.team_id)
        showToast({ type: 'success', message: v.success })
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : v.invalid
        showToast({ type: 'info', message: msg })
      })
      .finally(() => setAccepting(false))
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-white/40">…</div>
    )
  }

  if (!preview?.valid) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-medium text-white">{v.invalid}</p>
        <button
          type="button"
          onClick={() => navigate('/home/projects')}
          className="create-team-btn create-team-btn--primary ui-clickable mt-6"
        >
          {v.goProjects}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">{v.title}</h1>
      <p className="mt-2 text-sm text-white/45">{v.desc}</p>
      <div className="team-join-card mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xl font-medium text-white">{preview.team_name}</p>
        <p className="mt-2 text-sm text-white/40">
          {v.memberCount.replace('{count}', String(preview.member_count))}
        </p>
        {preview.unlimited_quota && (
          <p className="mt-3 text-xs text-sky-300/80">{v.unlimitedNote}</p>
        )}
      </div>
      {joined ? (
        <button
          type="button"
          onClick={() => navigate('/home/projects')}
          className="create-team-btn create-team-btn--primary ui-clickable mt-8 w-full max-w-xs"
        >
          {v.goProjects}
        </button>
      ) : (
        <button
          type="button"
          disabled={accepting}
          onClick={handleAccept}
          className="create-team-btn create-team-btn--primary ui-clickable mt-8 w-full max-w-xs disabled:opacity-40"
        >
          {accepting ? v.accepting : v.accept}
        </button>
      )}
    </div>
  )
}
