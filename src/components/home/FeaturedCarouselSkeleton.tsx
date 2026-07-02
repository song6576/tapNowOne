import { memo } from 'react'
import { Skeleton } from '../ui/Skeleton'

export const FeaturedCarouselSkeleton = memo(function FeaturedCarouselSkeleton() {
  return (
    <section className="relative mx-auto w-full max-w-[1200px]">
      <Skeleton className="mb-5 h-6 w-24" />
      <div className="flex gap-4 overflow-hidden pb-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="home-featured-card shrink-0">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </section>
  )
})
