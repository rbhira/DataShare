import { expect, test } from '@playwright/test';

test('crée un compte puis se connecte', async ({ page }) => {
  const email = `e2e-${Date.now()}@datashare.test`;
  const password = 'DataShare123!';

  await page.goto('/register');

  await page.locator('#register-email').fill(email);
  await page.locator('#register-password').fill(password);
  await page.locator('#register-confirm-password').fill(password);

  const registerResponsePromise = page.waitForResponse(
  response =>
    response.url().includes('/api/auth/register') &&
    response.request().method() === 'POST'
  );

  await page.locator('button[type="submit"]').click();

  const registerResponse = await registerResponsePromise;

  expect(registerResponse.status()).toBe(201);
  await expect(page).toHaveURL(/\/login$/);

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);

  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/upload$/);
  await expect(
    page.getByRole('heading', { name: 'Ajouter un fichier' })
  ).toBeVisible();
});