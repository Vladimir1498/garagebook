import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /войти|sign in/i })).toBeVisible()
  })

  test('should show registration form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /создать|sign up/i })).toBeVisible()
  })

  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /войти|sign in/i }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Cars', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.getByRole('button', { name: /войти|sign in/i }).click()
    await page.waitForURL('/')
  })

  test('should navigate to cars page', async ({ page }) => {
    await page.click('a[href="/cars"]')
    await expect(page).toHaveURL('/cars')
    await expect(page.getByText(/автомобили/i)).toBeVisible()
  })

  test('should open add car form', async ({ page }) => {
    await page.goto('/cars/new')
    await expect(page.getByText(/добавить автомобиль/i)).toBeVisible()
  })
})
