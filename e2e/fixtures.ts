import { test as base, expect } from '@playwright/test'

const testUser = {
  id: 'e2e-user',
  email: 'creator@example.test',
  name: '林墨',
  avatar_url: null,
  created_at: '2026-01-15T08:00:00.000Z',
}

export const test = base.extend({
  page: async ({ page }, runTest) => {
    await page.route('https://images.unsplash.com/**', (route) => route.abort())
    await page.addInitScript((user) => {
      localStorage.setItem('tapflow_user', JSON.stringify(user))
      localStorage.setItem('tapflow_lang', 'zh')
      localStorage.removeItem('tapflow_token')
      localStorage.removeItem('tapflow_project')
    }, testUser)
    await runTest(page)
  },
})

export { expect }
