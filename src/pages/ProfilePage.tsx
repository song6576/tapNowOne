/** 个人主页：背景横幅、资料侧栏、作品集与代表作 */
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useProfileStore } from '../store/profileStore'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'

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

const BANNER_PRESETS = [
  'linear-gradient(135deg, #1a1a1e 0%, #2d2d35 50%, #1a1a1e 100%)',
  'linear-gradient(135deg, #1e1b2e 0%, #3d2c5a 50%, #1a1528 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
]

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const profile = useProfileStore((s) => s.profile)
  const init = useProfileStore((s) => s.init)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const openAccountModal = useProfileStore((s) => s.openAccountModal)
  const { t } = useI18n()
  const p = t.profile
  const showToast = useToastStore((s) => s.showToast)

  const [mainTab, setMainTab] = useState<'portfolio' | 'saved'>('portfolio')
  const [contentTab, setContentTab] = useState<'works' | 'series'>('works')

  useEffect(() => { init() }, [init])

  if (!user) return null

  const cycleBanner = () => {
    const idx = BANNER_PRESETS.indexOf(profile.bannerStyle)
    const next = BANNER_PRESETS[(idx + 1 + BANNER_PRESETS.length) % BANNER_PRESETS.length]
    updateProfile({ bannerStyle: next })
    showToast({ type: 'success', message: p.changeBanner })
  }

  return (
    <main className="profile-page flex-1 overflow-y-auto">
      <div className="profile-banner" style={{ background: profile.bannerStyle }}>
        <button type="button" onClick={cycleBanner} className="profile-banner-btn ui-clickable">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {p.changeBanner}
        </button>
      </div>

      <div className="profile-body mx-auto max-w-[1200px] px-5 pb-12 md:px-8">
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-sidebar-card">
              <div className="relative mx-auto w-fit">
                <ProfileAvatar name={user.name} avatarUrl={user.avatar_url} />
                <button
                  type="button"
                  onClick={() => openAccountModal('personal')}
                  className="profile-avatar-edit ui-clickable"
                  title={t.account.nav.personal}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <h1 className="mt-4 text-center text-lg font-semibold text-white">{user.name}</h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-white/45">{profile.bio}</p>

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
                onClick={() => showToast({ type: 'info', message: p.savedLocked })}
                className="profile-main-tab ui-clickable flex items-center gap-1.5 text-white/35"
              >
                {p.tabSaved}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

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
                    {p.tabWorks} (0)
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
              <div className="profile-works-empty mt-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
                {p.worksEmpty}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
