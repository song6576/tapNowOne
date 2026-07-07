/** 首页：Hero 输入框 + 最近项目 + 精选轮播 + 探索 TapTV */
import { useQueryClient } from '@tanstack/react-query'
import { HeroPrompt } from '../components/home/HeroPrompt'
import { ProjectRow } from '../components/home/ProjectRow'
import { FeaturedCarousel } from '../components/home/FeaturedCarousel'
import { ProjectRowSkeleton } from '../components/home/ProjectRowSkeleton'
import { FeaturedCarouselSkeleton } from '../components/home/FeaturedCarouselSkeleton'
import type { TapTVItem } from '../mock/data'
import { TapTVExploreSection } from '../components/home/TapTVExploreSection'
import { useHomeDashboard } from '../hooks/useHomeQueries'
import { queryKeys } from '../lib/queryKeys'
import type { HomeDashboard } from '../api/client'
import { useWorkspaceStore } from '../store/workspaceStore'

export function HomePage() {
  const queryClient = useQueryClient()
  const workspaceReady = useWorkspaceStore((s) => s.initialized)
  const { data, isLoading } = useHomeDashboard()

  const featured = data?.featured ?? []
  const taptv = data?.taptv ?? []
  const projectsLoading = !workspaceReady || isLoading

  const handleTapTVItemsChange = (items: TapTVItem[]) => {
    queryClient.setQueryData<HomeDashboard>(queryKeys.home.dashboard, (prev) =>
      prev ? { ...prev, taptv: items } : prev,
    )
  }

  return (
    <main className="home-page flex flex-1 flex-col overflow-y-auto">
      <div className="home-page-grid flex flex-col">
        <section className="home-hero-pad pb-6 pt-8 md:pt-10">
          <div className="home-hero-stack">
            <HeroPrompt />
            <div className="mt-8">
              {projectsLoading ? <ProjectRowSkeleton /> : <ProjectRow />}
            </div>
          </div>
        </section>

        <section className="home-featured-section home-section-pad border-t border-white/[0.04]">
          <div className="home-wide-stack">
            {isLoading ? <FeaturedCarouselSkeleton /> : <FeaturedCarousel items={featured} />}
          </div>
        </section>

        <section className="home-taptv-section home-section-pad border-t border-white/[0.04] py-10 md:py-12">
          <div className="home-wide-stack">
            {!isLoading && (
              <TapTVExploreSection
                items={taptv}
                onItemsChange={handleTapTVItemsChange}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
