/** 画布项目 localStorage：加载/保存/导入/导出 JSON */
import type { CanvasProject } from '../types'
import { generateUUID } from './uuid'

const STORAGE_KEY = 'tapflow_project'

export function loadProject(): CanvasProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CanvasProject
  } catch {
    return null
  }
}

export function saveProject(project: CanvasProject): void {
  project.updatedAt = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
}

export function exportProject(project: CanvasProject): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name || 'canvas'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProject(file: File): Promise<CanvasProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string) as CanvasProject)
      } catch {
        reject(new Error('无效的 JSON 文件'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

export function createEmptyProject(name = '未命名项目'): CanvasProject {
  const now = new Date().toISOString()
  return {
    id: generateUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  }
}
