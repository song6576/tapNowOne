import { test, expect } from './fixtures'

test.describe('Canvas 核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/canvas')
    await expect(page.getByRole('button', { name: '文字生成视频' })).toBeVisible()
  })

  test('文字生成视频会创建并连接正确节点', async ({ page }) => {
    await page.getByRole('button', { name: '文字生成视频' }).click()

    await expect(page.locator('.react-flow__node')).toHaveCount(2)
    await expect(page.locator('.canvas-node-label')).toContainText(['Video brief', 'Text to video'])
    await expect(page.locator('.react-flow__edge')).toHaveCount(1)
  })

  test('图片生成视频可以配置视频参数', async ({ page }) => {
    await page.getByRole('button', { name: '图片生成视频' }).click()
    await expect(page.locator('.react-flow__node')).toHaveCount(2)

    await page.locator('.react-flow__node-video').click()
    await expect(page.locator('.node-inline-editor')).toBeVisible()
    await page.getByRole('button', { name: '视频参数' }).click()

    const ratioGroup = page.getByRole('radiogroup', { name: '画面比例' })
    await expect(ratioGroup).toBeVisible()
    await ratioGroup.getByRole('radio', { name: '9:16' }).click()
    await expect(ratioGroup.getByRole('radio', { name: '9:16' })).toHaveAttribute('aria-checked', 'true')
  })

  test('Agent 面板可打开并收起', async ({ page }) => {
    await page.getByRole('button', { name: '消息' }).click()
    await expect(page.locator('.canvas-agent-panel')).toBeVisible()

    await page.getByRole('button', { name: '收起' }).click()
    await expect(page.locator('.canvas-agent-panel')).toBeHidden()
    await expect(page.getByRole('button', { name: '打开 AI 助手' })).toBeVisible()
  })

  test('添加节点菜单支持键盘关闭并创建节点', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '添加节点' })
    await addButton.click()

    const menu = page.getByRole('menu', { name: '添加节点' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: /文本/ })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()

    await addButton.click()
    await menu.getByRole('menuitem', { name: /文本/ }).click()
    await expect(page.locator('.react-flow__node-text')).toHaveCount(1)
  })

  test('节点右键菜单可以复制、粘贴和删除', async ({ page }) => {
    await page.getByRole('button', { name: '文字生成视频' }).click()
    const textNode = page.locator('.react-flow__node-text')
    await textNode.click({ button: 'right' })

    let menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: /复制/ })).toBeFocused()
    await menu.getByRole('menuitem', { name: /复制/ }).click()

    await textNode.click({ button: 'right' })
    menu = page.getByRole('menu')
    await menu.getByRole('menuitem', { name: /粘贴/ }).click()
    await expect(page.locator('.react-flow__node')).toHaveCount(3)

    const pastedNode = page.locator('.react-flow__node-text').last()
    await pastedNode.click({ button: 'right' })
    await page.getByRole('menu').getByRole('menuitem', { name: /删除/ }).click()
    await expect(page.locator('.react-flow__node')).toHaveCount(2)
  })

  test('分组复制会保留子节点与内部连线，并支持快捷键解组', async ({ page }) => {
    await page.getByRole('button', { name: '文字生成视频' }).click()
    const nodes = page.locator('.react-flow__node')
    await nodes.nth(0).click()
    await nodes.nth(1).click({ modifiers: ['Shift'] })
    await expect(page.getByRole('toolbar', { name: '打组' })).toBeVisible()

    await page.keyboard.press('Meta+g')
    await expect(page.locator('.react-flow__node-group')).toHaveCount(1)
    await expect(page.locator('.react-flow__node')).toHaveCount(3)

    await page.getByRole('button', { name: '命名', exact: true }).click()
    const renameInput = page.getByRole('textbox', { name: '命名' })
    await renameInput.fill('临时名称')
    await renameInput.press('Escape')
    await expect(page.locator('.canvas-group-node-label-text')).toHaveText('Group')

    await page.getByRole('button', { name: '命名', exact: true }).click()
    await page.getByRole('textbox', { name: '命名' }).fill('镜头组合')
    await page.getByRole('textbox', { name: '命名' }).press('Enter')
    await expect(page.locator('.canvas-group-node-label-text')).toHaveText('镜头组合')

    await page.keyboard.press('Meta+c')
    await page.keyboard.press('Meta+v')
    await expect(page.locator('.react-flow__node-group')).toHaveCount(2)
    await expect(page.locator('.react-flow__node')).toHaveCount(6)
    await expect(page.locator('.react-flow__edge')).toHaveCount(2)

    await page.keyboard.press('Meta+Shift+g')
    await expect(page.locator('.react-flow__node-group')).toHaveCount(1)
    await expect(page.locator('.react-flow__node')).toHaveCount(5)
    await expect(page.locator('.react-flow__edge')).toHaveCount(2)
  })

  test('从节点输出点拖到空白处可以创建并自动连接新节点', async ({ page }) => {
    await page.getByRole('button', { name: '添加节点' }).click()
    await page.getByRole('menuitem', { name: /文本/ }).click()

    const sourceHandle = page.locator('.react-flow__node-text .canvas-node-handle--right')
    const box = await sourceHandle.boundingBox()
    expect(box).not.toBeNull()
    const startX = box!.x + box!.width / 2
    const startY = box!.y + box!.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 360, startY + 80, { steps: 12 })
    await page.mouse.up()

    const menu = page.getByRole('menu', { name: '添加节点' })
    await expect(menu).toBeVisible()
    await menu.getByRole('menuitem', { name: '图片', exact: true }).click()

    await expect(page.locator('.react-flow__node')).toHaveCount(2)
    await expect(page.locator('.react-flow__node-image')).toHaveCount(1)
    await expect(page.locator('.react-flow__edge')).toHaveCount(1)
  })
})
