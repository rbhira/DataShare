import { expect, test } from '@playwright/test';

test('accède au lien public et télécharge le fichier', async ({ page, browser }) => {
  const email = `e2e-download-${Date.now()}@datashare.test`;
  const password = 'DataShare123!';
  const fileName = 'e2e-public-download.txt';

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
    name: fileName,
    mimeType: 'text/plain',
    buffer: Buffer.from('Téléchargement E2E DataShare')
  });

  await page.locator('#upload-expiration').selectOption('1');

  await page.getByRole('button', { name: /Téléverser/i }).click();

  await expect(page.locator('#download-link')).toBeVisible();

  const downloadLink = await page.locator('#download-link').inputValue();

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();

  await publicPage.goto(downloadLink);

  await expect(
    publicPage.getByRole('heading', { name: 'Télécharger un fichier' })
  ).toBeVisible();

  await expect(
    publicPage.getByText(fileName)
  ).toBeVisible();

  const downloadPromise = publicPage.waitForEvent('download');

  await publicPage.getByRole(
    'button',
    { name: /^Télécharger$/i }
  ).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(fileName);
  expect(await download.failure()).toBeNull();

  await publicContext.close();
});