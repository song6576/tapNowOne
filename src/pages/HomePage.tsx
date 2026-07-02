import { useEffect, useState } from 'react'
import { HeroPrompt } from '../components/home/HeroPrompt'
import { ProjectRow } from '../components/home/ProjectRow'
import { FeaturedCarousel } from '../components/home/FeaturedCarousel'
import { mockGetFeatured, mockListProjects } from '../mock/api'
import type { FeaturedItem, MockProject } from '../mock/data'

export function HomePage() {
  const [projects, setProjects] = useState<MockProject[]>([])
  const [featured, setFeatured] = useState<FeaturedItem[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([mockListProjects(), mockGetFeatured()]).then(([p, f]) => {
      if (!cancelled) {
        setProjects(p)
        setFeatured(f)
      }
    })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="home-page flex flex-1 flex-col overflow-y-auto">
      <div className="home-page-grid flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center px-5 py-10 md:px-8">
          <HeroPrompt />
          <div className="mt-10">
            <ProjectRow projects={projects} />
          </div>
        </div>

        <section className="border-t border-white/[0.04] px-5 py-10 md:px-8">
          <FeaturedCarousel items={featured} />
        </section>
      </div>
    </main>
  )
}
