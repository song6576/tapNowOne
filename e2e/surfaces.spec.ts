import { test, expect } from './fixtures'

test.describe('Home、工作空间与 TapTV', () => {
  test('移动端主导航可以在三个页面之间切换', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/home')

    const mobileNav = page.locator('.home-mobile-nav')
    await expect(mobileNav).toBeVisible()
    await mobileNav.getByRole('link', { name: '工作空间' }).click()
    await expect(page).toHaveURL(/\/home\/projects$/)
    await expect(page.getByRole('button', { name: '个人', exact: true })).toBeVisible()
  })

  test('工作空间支持网格与列表视图切换', async ({ page }) => {
    await page.goto('/home/projects')
    await expect(page.locator('.workspace-project-grid')).toBeVisible()

    await page.getByRole('button', { name: '列表视图' }).click()
    await expect(page.locator('.workspace-list-wrap')).toBeVisible()

    await page.getByRole('button', { name: '网格视图' }).click()
    await expect(page.locator('.workspace-project-grid')).toBeVisible()
  })

  test('TapTV 分类筛选会更新作品列表', async ({ page }) => {
    await page.goto('/taptv')
    await expect(page.locator('.taptv-card').first()).toBeVisible()

    await page.getByRole('button', { name: 'MV', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'MV 视觉叙事' })).toBeVisible()
    await expect(page.locator('.taptv-card')).toHaveCount(1)
  })
})
