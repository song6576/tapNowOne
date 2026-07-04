/** 最近项目行加载骨架屏 */
import { memo } from 'react'
import { Skeleton } from '../ui/Skeleton'

export const ProjectRowSkeleton = memo(function ProjectRowSkeleton() {
  return (
    <section className="w-full">
      <div className="home-project-grid">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="home-project-card overflow-hidden"
          >
            {i === 0 ? (
              <>
                <div className="home-project-thumb home-project-new-thumb">
                  <Skeleton className="h-[52px] w-[52px] rounded-full" />
                </div>
                <div className="p-3">
                  <Skeleton className="h-4 w-16" />
                </div>
              </>
            ) : (
              <>
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="mt-2 h-6 w-2/3 rounded-full" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Skeleton className="h-4 w-20" />
      </div>
    </section>
  )
})
