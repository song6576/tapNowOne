export type GenerationTask = {
  id: string
  type: 'image' | 'video' | 'audio' | 'text'
  label: string
  status: 'done' | 'generating' | 'error'
  thumbnail?: string
  nodeId?: string
  createdAt: string
}
