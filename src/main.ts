import { once, showUI } from '@create-figma-plugin/utilities'

import { CloseHandler, CreateRectanglesHandler } from './types'
import { runAllTests } from './color-system/test-foundation'
import { ColorSystemManager } from './color-system/manager'

export default function () {
  // Test foundation functionality
  console.log('🚀 Starting Color System Foundation Tests...')
  try {
    runAllTests()
    figma.notify('✅ Foundation tests completed successfully!', { timeout: 3000 })
  } catch (error) {
    console.error('❌ Foundation tests failed:', error)
    figma.notify('❌ Foundation tests failed - check console', { error: true, timeout: 3000 })
  }

  // Test manager functionality
  console.log('\n🧪 Testing Manager Integration...')
  const manager = new ColorSystemManager()
  manager.testManager()

  // Legacy rectangle creation (to be removed)
  once<CreateRectanglesHandler>('CREATE_RECTANGLES', function (count: number) {
    const nodes: Array<SceneNode> = []
    for (let i = 0; i < count; i++) {
      const rect = figma.createRectangle()
      rect.x = i * 150
      rect.fills = [
        {
          color: { b: 0, g: 0.5, r: 1 },
          type: 'SOLID'
        }
      ]
      figma.currentPage.appendChild(rect)
      nodes.push(rect)
    }
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
    figma.closePlugin()
  })

  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    height: 124,
    width: 240
  })
}
