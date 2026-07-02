import { memo } from 'react'
import { Skeleton } from '../ui/Skeleton'

export const ProjectRowSkeleton = memo(function ProjectRowSkeleton() {
  return (
    <section className="mx-auto w-full max-w-[960px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="home-project-card overflow-hidden"
            style={{ minHeight: i === 0 ? 180 : undefined }}
          >
            {i === 0 ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 py-10">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
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
