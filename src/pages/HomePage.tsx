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
      <div className="home-page-grid flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center px-5 py-10 md:px-8">
          <HeroPrompt />
          <div className="mt-10">
            {loading ? <ProjectRowSkeleton /> : <ProjectRow projects={projects} />}
          </div>
        </div>

        <section className="border-t border-white/[0.04] px-5 py-10 md:px-8">
          {loading ? <FeaturedCarouselSkeleton /> : <FeaturedCarousel items={featured} />}
        </section>

        <section className="border-t border-white/[0.04] px-5 py-10 md:px-8">
          {!loading && <TapTVExploreSection items={taptv} />}
        </section>
      </div>
    </main>
  )
}
