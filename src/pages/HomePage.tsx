/** 首页：Hero 输入框 + 最近项目 + 精选轮播 + 探索 TapTV（mock 并行加载） */
import { useEffect, useState } from 'react'
import { HeroPrompt } from '../components/home/HeroPrompt'
import { ProjectRow } from '../components/home/ProjectRow'
import { FeaturedCarousel } from '../components/home/FeaturedCarousel'
import { ProjectRowSkeleton } from '../components/home/ProjectRowSkeleton'
import { FeaturedCarouselSkeleton } from '../components/home/FeaturedCarouselSkeleton'
import { mockGetFeatured, mockGetTapTV, mockListProjects } from '../mock/api'
import type { FeaturedItem, MockProject, TapTVItem } from '../mock/data'
import { TapTVExploreSection } from '../components/home/TapTVExploreSection'

export function HomePage() {
  const [projects, setProjects] = useState<MockProject[]>([])
  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const [taptv, setTaptv] = useState<TapTVItem[]>([])
  const [loading, setLoading] = useState(true)

  // 并行拉取首页三块数据；组件卸载时 cancelled 防止 setState 泄漏
  useEffect(() => {
    let cancelled = false
    Promise.all([mockListProjects(), mockGetFeatured(), mockGetTapTV()])
      .then(([p, f, tv]) => {
        if (!cancelled) {
          setProjects(p)
          setFeatured(f)
          setTaptv(tv)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="home-page flex flex-1 flex-col overflow-y-auto">
      <div className="home-page-grid flex flex-col">
        <section className="home-hero-pad pb-6 pt-8 md:pt-10">
          <div className="home-hero-stack">
            <HeroPrompt />
            <div className="mt-8">
              {loading ? <ProjectRowSkeleton /> : <ProjectRow projects={projects} />}
            </div>
          </div>
        </section>

        <section className="home-featured-section home-section-pad border-t border-white/[0.04]">
          <div className="home-wide-stack">
            {loading ? <FeaturedCarouselSkeleton /> : <FeaturedCarousel items={featured} />}
          </div>
        </section>

        <section className="home-taptv-section home-section-pad border-t border-white/[0.04] py-10 md:py-12">
          <div className="home-wide-stack">
            {!loading && <TapTVExploreSection items={taptv} />}
          </div>
        </section>
      </div>
    </main>
  )
}
