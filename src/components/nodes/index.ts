/** ReactFlow nodeTypes 注册表 */
import type { NodeTypes } from '@xyflow/react'
import { TextNode } from './TextNode'
import { ImageNode } from './ImageNode'
import { VideoNode } from './VideoNode'
import { AudioNode } from './AudioNode'
import { GroupNode } from './GroupNode'

export const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  audio: AudioNode,
  group: GroupNode,
}
