let bootstrapCompleted = false

export function isBootstrapCompleted() {
  return bootstrapCompleted
}

export function markBootstrapCompleted() {
  bootstrapCompleted = true
}

export function resetAppBootstrap() {
  bootstrapCompleted = false
}
