import { expect, test } from '@playwright/test';

test('téléverse un fichier et génère un lien de téléchargement', async ({ page }) => {
  const email = `e2e-upload-${Date.now()}@datashare.test`;
  const password = 'DataShare123!';

  await page.goto('/register');

  await page.locator('#register-email').fill(email);
  await page.locator('#register-password').fill(password);
  await page.locator('#register-confirm-password').fill(password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/login$/);

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/upload$/);

  await page.locator('#upload-file').setInputFiles({
    name: 'e2e-datashare.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Fichier de test E2E DataShare')
  });

  await page.locator('#upload-expiration').selectOption('1');

  await page.getByRole('button', { name: /Téléverser/i }).click();

  await expect(page.locator('#download-link')).toBeVisible();

  const downloadLink = await page.locator('#download-link').inputValue();

  expect(downloadLink).toMatch(/\/download\/.+/);

  await expect(page.getByText('e2e-datashare.txt')).toBeVisible();
});