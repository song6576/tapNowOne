/** 精选轮播加载骨架屏 */
import { memo } from 'react'
import { Skeleton } from '../ui/Skeleton'

export const FeaturedCarouselSkeleton = memo(function FeaturedCarouselSkeleton() {
  return (
    <section className="home-featured-carousel">
      <Skeleton className="mb-5 h-7 w-28" />
      <div className="home-featured-stage">
        <div className="home-carousel-track home-carousel-track--static">
          {[0, 1, 2].map((i) => (
            <div key={i} className="home-featured-card">
              <Skeleton className="home-featured-cover w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="home-carousel-dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="home-carousel-dot" />
        ))}
      </div>
    </section>
  )
})
