/**
 * 主应用壳一次性初始化：profile + team + workspace。
 * auth 在 main.tsx 启动时校验；此处 await 以确保顺序。
 */
import { createInFlight } from '../utils/inFlight'
import { isBootstrapCompleted, markBootstrapCompleted } from './appBootstrapState'
import { useAuthStore } from './authStore'
import { useProfileStore } from './profileStore'
import { useTeamStore } from './teamStore'
import { useWorkspaceStore } from './workspaceStore'

const runBootstrap = createInFlight()

export function bootstrapAppShell() {
  if (isBootstrapCompleted()) return Promise.resolve()
  return runBootstrap(async () => {
    useProfileStore.getState().init()

    await useAuthStore.getState().init()

    const user = useAuthStore.getState().user
    if (user?.name) {
      await useTeamStore.getState().init(user.name)
    }

    await useWorkspaceStore.getState().init()
    markBootstrapCompleted()
  })
}
