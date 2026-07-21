import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { useI18n } from '../../store/langStore'

export function RouteLoading({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  return (
    <div
      className={`route-loading ${compact ? 'route-loading--compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="route-loading-spinner" aria-hidden />
      <span>{t.routeState.loading}</span>
    </div>
  )
}

export function OverlayLoading() {
  const { t } = useI18n()
  return (
    <div className="route-loading-overlay" role="status" aria-live="polite">
      <span className="route-loading-spinner" aria-hidden />
      <span>{t.routeState.loading}</span>
    </div>
  )
}

class RouteErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route chunk failed to load', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function RouteError() {
  const { t } = useI18n()
  return (
    <div className="route-loading route-loading--error" role="alert">
      <strong>{t.routeState.loadFailed}</strong>
      <button type="button" className="ui-clickable" onClick={() => window.location.reload()}>
        {t.routeState.retry}
      </button>
    </div>
  )
}

export function RouteBoundary({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary fallback={<RouteError />}>
      <Suspense fallback={<RouteLoading />}>{children}</Suspense>
    </RouteErrorBoundary>
  )
}
