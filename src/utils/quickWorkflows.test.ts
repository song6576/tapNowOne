import { describe, expect, it } from 'vitest'
import { buildQuickWorkflow, type QuickWorkflowId } from './quickWorkflows'

describe('buildQuickWorkflow', () => {
  const ids: QuickWorkflowId[] = [
    'textToVideo',
    'imageToVideo',
    'smartVideo',
    'mixVideo',
    'lyrics',
  ]

  it.each(ids)('%s returns a connected, focusable workflow', (id) => {
    const workflow = buildQuickWorkflow(id)

    expect(workflow.nodes.length).toBeGreaterThan(1)
    expect(workflow.focusIndex).toBeGreaterThanOrEqual(0)
    expect(workflow.focusIndex).toBeLessThan(workflow.nodes.length)

    for (const [source, target] of workflow.edges) {
      expect(source).toBeGreaterThanOrEqual(0)
      expect(target).toBeGreaterThanOrEqual(0)
      expect(source).toBeLessThan(workflow.nodes.length)
      expect(target).toBeLessThan(workflow.nodes.length)
      expect(source).not.toBe(target)
    }
  })

  it('creates the promised text-to-video topology', () => {
    const workflow = buildQuickWorkflow('textToVideo')
    expect(workflow.nodes.map((node) => node.type)).toEqual(['text', 'video'])
    expect(workflow.edges).toEqual([[0, 1]])
  })

  it('creates the promised image-to-video topology', () => {
    const workflow = buildQuickWorkflow('imageToVideo')
    expect(workflow.nodes.map((node) => node.type)).toEqual(['image', 'video'])
    expect(workflow.edges).toEqual([[0, 1]])
  })
})
