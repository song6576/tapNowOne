/** 个人主页：背景横幅、资料侧栏、作品集与代表作 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TapTVCard } from '../components/taptv/TapTVCard'
import { uploadBanner, uploadAvatar } from '../api/client'
import { ProjectGridCard } from '../components/project/ProjectGridCard'
import { NewProjectCard } from '../components/project/NewProjectCard'
import type { TapTVItem } from '../mock/data'
import { listTapTVFavorites, toggleTapTVFavorite, toggleTapTVLike } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useProfileStore } from '../store/profileStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'
import { getToken } from '../utils/auth'
import type { AppLang } from '../utils/lang'

function ProfileAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="profile-avatar-img" />
  }
  const initial = name.trim()[0] ?? 'U'
  return (
    <span className="profile-avatar-img flex items-center justify-center bg-gradient-to-br from-pink-400 to-rose-500 text-3xl font-medium text-white">
      {initial}
    </span>
  )
}

const DEFAULT_BANNER = 'linear-gradient(135deg, #1a1a1e 0%, #2d2d35 50%, #1a1a1e 100%)'

function formatJoinDate(value: string, lang: AppLang, label: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const locale = lang === 'zh' ? 'zh-CN' : lang
  const formatted = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(date)

  return lang === 'zh' ? `${formatted}${label}` : `${label} ${formatted}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const profile = useProfileStore((s) => s.profile)
  const init = useProfileStore((s) => s.init)
  const openAccountModal = useProfileStore((s) => s.openAccountModal)
  const wsReload = useWorkspaceStore((s) => s.reload)
  const projects = useWorkspaceStore((s) => s.projects)
  const wsLoading = useWorkspaceStore((s) => s.loading)
  const createProject = useWorkspaceStore((s) => s.createProject)
  const { lang, t } = useI18n()
  const p = t.profile
  const showToast = useToastStore((s) => s.showToast)

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects],
  )

  useEffect(() => { init() }, [init])
  useEffect(() => { void wsReload() }, [wsReload])

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [mainTab, setMainTab] = useState<'portfolio' | 'saved'>('portfolio')
  const [contentTab, setContentTab] = useState<'works' | 'series'>('works')
  const [favorites, setFavorites] = useState<TapTVItem[]>([])
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (mainTab !== 'saved' || !user) return
    let cancelled = false
    setFavLoading(true)
    void listTapTVFavorites()
      .then((list) => {
        if (!cancelled) setFavorites(list)
      })
      .catch(() => {
        if (!cancelled) setFavorites([])
      })
      .finally(() => {
        if (!cancelled) setFavLoading(false)
      })
    return () => { cancelled = true }
  }, [mainTab, user])

  const patchFavorite = (id: string, patch: Partial<TapTVItem>) => {
    setFavorites((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      if (patch.favoritedByMe === false) {
        return next.filter((item) => item.id !== id)
      }
      return next
    })
  }

  const handleFavoriteLike = async (item: TapTVItem) => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    try {
      const res = await toggleTapTVLike(item.id)
      patchFavorite(item.id, { likedByMe: res.liked, likes: res.likes })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : p.savedEmpty })
    }
  }

  const handleFavoriteToggle = async (item: TapTVItem) => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    try {
      const res = await toggleTapTVFavorite(item.id)
      patchFavorite(item.id, { favoritedByMe: res.favorited, favorites: res.favorites })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : p.savedEmpty })
    }
  }

  const handleNewProject = async () => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    const proj = await createProject(null)
    navigate(`/canvas/${proj.id}`)
  }

  if (!user) return null

  const joinDate =
    (user.show_join_date ?? profile.showJoinDate)
      ? formatJoinDate(user.created_at, lang, p.joinedAt)
      : null

  const pickBannerImage = () => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    bannerInputRef.current?.click()
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { user: nextUser } = await uploadBanner(file)
      updateUser(nextUser)
      showToast({ type: 'success', message: p.uploadBanner })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' })
    }
  }

  const pickAvatar = () => {
    if (!getToken()) {
      navigate('/login')
      return
    }
    avatarInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { user: nextUser } = await uploadAvatar(file)
      updateUser(nextUser)
      showToast({ type: 'success', message: t.account.personalProfile })
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' })
    }
  }

  const bannerBackground = user.banner_url
    ? `url(${user.banner_url}) center/cover no-repeat`
    : profile.bannerStyle || DEFAULT_BANNER

  return (
    <main className="profile-page flex-1 overflow-y-auto">
      <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload} />
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
      <div className="profile-banner group" style={{ background: bannerBackground }}>
        <div className="profile-banner-actions">
          <button type="button" onClick={pickBannerImage} className="profile-banner-btn ui-clickable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {p.uploadBanner}
          </button>
        </div>
      </div>

      <div className="profile-body mx-auto max-w-[1200px] px-5 pb-12 md:px-8">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-sidebar-card">
              <div className="relative mx-auto w-fit">
                <button type="button" onClick={() => openAccountModal('personal')} className="ui-clickable block rounded-full" title={t.account.nav.personal}>
                  <ProfileAvatar name={user.name} avatarUrl={user.avatar_url} />
                </button>
                <button
                  type="button"
                  onClick={pickAvatar}
                  className="profile-avatar-edit ui-clickable"
                  title={p.uploadAvatar}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <h1 className="mt-4 text-center text-lg font-semibold text-white">{user.name}</h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-white/45">
                {user.bio || profile.bio || 'I am turning imagination into reality.'}
              </p>
              {joinDate && (
                <p className="mt-3 text-center text-xs text-white/35">
                  {joinDate}
                </p>
              )}

              <div className="profile-stats mt-6 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-medium text-white">0</p>
                  <p className="text-xs text-white/35">{p.following}</p>
                </div>
                <div>
                  <p className="text-base font-medium text-white">0</p>
                  <p className="text-xs text-white/35">{p.followers}</p>
                </div>
                <div>
                  <p className="text-base font-medium text-white">0</p>
                  <p className="text-xs text-white/35">{p.favorites}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast({ type: 'info', message: p.share })}
                className="profile-share-btn ui-clickable mt-6 w-full"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {p.share}
              </button>
            </div>
          </aside>

          <div className="profile-main min-w-0 flex-1">
            <div className="profile-main-tabs">
              <button
                type="button"
                onClick={() => setMainTab('portfolio')}
                className={`profile-main-tab ui-clickable ${mainTab === 'portfolio' ? 'profile-main-tab--active' : ''}`}
              >
                {p.tabPortfolio}
              </button>
              <button
                type="button"
                onClick={() => setMainTab('saved')}
                className={`profile-main-tab ui-clickable flex items-center gap-1.5 ${mainTab === 'saved' ? 'profile-main-tab--active' : ''}`}
              >
                {p.tabSaved}
              </button>
            </div>

            {mainTab === 'saved' ? (
              <section className="profile-saved mt-8">
                {favLoading ? (
                  <div className="profile-works-empty flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                    {t.taptv.detail.loading}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="profile-works-empty flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                    {p.savedEmpty}
                  </div>
                ) : (
                  <div className="taptv-explore-grid">
                    {favorites.map((item) => (
                      <TapTVCard
                        key={item.id}
                        item={item}
                        onClick={() => navigate(`/taptv/${item.id}`)}
                        onLike={() => void handleFavoriteLike(item)}
                        onFavorite={() => void handleFavoriteToggle(item)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
            <section className="profile-featured mt-8">
              <h2 className="text-sm font-medium text-white/70">{p.featuredWorks} (0/3)</h2>
              <div className="profile-featured-empty mt-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/25">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 15l5-5 4 4 3-3 6 6" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                <p className="mt-4 max-w-sm text-center text-sm text-white/40">{p.featuredEmpty}</p>
                <button
                  type="button"
                  onClick={() => showToast({ type: 'info', message: t.account.comingSoon })}
                  className="profile-add-btn ui-clickable mt-5"
                >
                  + {p.addFeatured}
                </button>
              </div>
            </section>

            <section className="profile-works mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="profile-sub-tabs">
                  <button
                    type="button"
                    onClick={() => setContentTab('works')}
                    className={`profile-sub-tab ui-clickable ${contentTab === 'works' ? 'profile-sub-tab--active' : ''}`}
                  >
                    {p.tabWorks} ({sortedProjects.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab('series')}
                    className={`profile-sub-tab ui-clickable ${contentTab === 'series' ? 'profile-sub-tab--active' : ''}`}
                  >
                    {p.tabSeries} (0)
                  </button>
                </div>
                <button type="button" className="profile-filter-btn ui-clickable">
                  {p.filterAll}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {contentTab === 'series' ? (
                <div className="profile-works-empty mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                  {t.account.comingSoon}
                </div>
              ) : wsLoading ? (
                <div className="profile-works-empty mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                  ...
                </div>
              ) : sortedProjects.length === 0 ? (
                <div className="mt-6">
                  <div className="profile-works-empty flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                    {p.worksEmpty}
                  </div>
                  <div className="mt-4 grid max-w-xs gap-4 sm:grid-cols-2">
                    <NewProjectCard variant="home" label={t.home.newProject} onClick={() => void handleNewProject()} />
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <NewProjectCard variant="home" label={t.home.newProject} onClick={() => void handleNewProject()} />
                  {sortedProjects.map((proj) => (
                    <ProjectGridCard
                      key={proj.id}
                      variant="home"
                      project={proj}
                      editedAtLabel={t.home.editedAt}
                      onOpen={() => navigate(`/canvas/${proj.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
