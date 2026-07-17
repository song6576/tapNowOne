import { describe, expect, it } from 'vitest'
import type { CanvasEdge, CanvasNode, NodeType } from '../types'
import { collectComposeTimeline } from './compose'

function node(
  id: string,
  type: NodeType,
  data: Partial<CanvasNode['data']> = {},
): CanvasNode {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label: id,
      prompt: '',
      status: 'done',
      ...data,
    },
  }
}

function edge(source: string, target: string): CanvasEdge {
  return { id: `${source}-${target}`, source, target }
}

describe('collectComposeTimeline', () => {
  it('uses final video instead of its intermediate image and adds text caption', () => {
    const nodes = [
      node('text', 'text', { outputText: '第一幕' }),
      node('image', 'image', { outputUrl: '/uploads/image.png', duration: 4 }),
      node('video', 'video', { outputUrl: '/uploads/video.mp4', duration: 5 }),
    ]
    const timeline = collectComposeTimeline(nodes, [
      edge('text', 'image'),
      edge('image', 'video'),
    ])

    expect(timeline.clips).toEqual([
      expect.objectContaining({ node_id: 'video', type: 'video', duration: 5 }),
    ])
    expect(timeline.captions).toEqual([
      { text: '第一幕', start: 0, end: 5 },
    ])
  })

  it('falls back to terminal image and aligns linked audio to its segment', () => {
    const nodes = [
      node('video', 'video', { outputUrl: '/uploads/first.mp4', duration: 3 }),
      node('image', 'image', { outputUrl: '/uploads/second.png', duration: 4 }),
      node('audio', 'audio', {
        outputUrl: '/uploads/voice.mp3',
        volume: 0.7,
      }),
    ]
    const timeline = collectComposeTimeline(nodes, [
      edge('video', 'image'),
      edge('image', 'audio'),
    ])

    expect(timeline.clips.map((clip) => clip.node_id)).toEqual(['video', 'image'])
    expect(timeline.audio_tracks).toEqual([
      { url: '/uploads/voice.mp3', start: 3, volume: 0.7 },
    ])
  })
})
