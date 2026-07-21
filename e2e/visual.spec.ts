import { test, expect } from './fixtures'

test.describe('1440×900 视觉基线', () => {
  test('登录页', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('tapflow_user')
      localStorage.removeItem('tapflow_token')
    })
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: '登录或注册' })).toBeVisible()

    await expect(page).toHaveScreenshot('login.png')
  })

  test('Home', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByRole('heading', { name: '今天要做点什么？' })).toBeVisible()
    await expect(page.getByText('精选推荐', { exact: true })).toBeVisible()

    await expect(page).toHaveScreenshot('home.png')
  })

  test('空画布', async ({ page }) => {
    await page.goto('/canvas')
    await expect(page.getByRole('button', { name: '文字生成视频' })).toBeVisible()

    await expect(page).toHaveScreenshot('canvas-empty.png')
  })

  test('添加节点菜单', async ({ page }) => {
    await page.goto('/canvas')
    await page.getByRole('button', { name: '添加节点' }).click()
    await expect(page.getByRole('menu', { name: '添加节点' })).toBeVisible()

    await expect(page).toHaveScreenshot('canvas-add-menu.png')
  })

  test('节点工作流与编辑器', async ({ page }) => {
    await page.goto('/canvas')
    await page.getByRole('button', { name: '图片生成视频' }).click()
    await page.locator('.react-flow__node-video').click()
    await expect(page.locator('.node-inline-editor')).toBeVisible()
    await page.getByRole('button', { name: '视频参数' }).click()
    await expect(page.getByRole('radiogroup', { name: '画面比例' })).toBeVisible()

    await expect(page).toHaveScreenshot('canvas-video-params.png')
  })

  test('分组与选区工具栏', async ({ page }) => {
    await page.goto('/canvas')
    await page.getByRole('button', { name: '文字生成视频' }).click()
    const nodes = page.locator('.react-flow__node')
    await nodes.nth(0).click()
    await nodes.nth(1).click({ modifiers: ['Shift'] })
    await page.getByRole('button', { name: '打组' }).click()
    await expect(page.getByRole('toolbar', { name: '解组' })).toBeVisible()

    await expect(page).toHaveScreenshot('canvas-group.png')
  })

  test('Agent 面板', async ({ page }) => {
    await page.goto('/canvas')
    await page.getByRole('button', { name: '消息' }).click()
    await expect(page.locator('.canvas-agent-panel')).toBeVisible()

    await expect(page).toHaveScreenshot('canvas-agent.png')
  })
})
