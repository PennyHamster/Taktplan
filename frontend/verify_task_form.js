
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log in as a manager
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('manager@taktplan.com');
  await page.getByLabel('Password').fill('managerpassword');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for navigation to the board
  await page.waitForURL(/\/*$/);

  // Open the "New Task" modal
  await page.getByRole('button', { name: '+ Neue Aufgabe' }).click();

  // Wait for the modal to appear
  await page.waitForSelector('h2:has-text("Neue Aufgabe")');

  // Verify the "Assign to" dropdown is visible
  await page.waitForSelector('label:has-text("Zuweisen an")');

  // Take a screenshot
  await page.screenshot({ path: '/usr/src/app/verification.png' });

  await browser.close();
})();
