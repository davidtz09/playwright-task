const { test, expect } = require('@playwright/test');

test('complete a three-product purchase from SauceDemo', async ({ page }) => {
  const products = [
    { name: 'Sauce Labs Backpack' },
    { name: 'Sauce Labs Bike Light' },
    { name: 'Sauce Labs Bolt T-Shirt' },
  ];

  await page.goto('https://www.saucedemo.com/');

  // getByLabel locators are used for the login form.
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Products', { exact: true })).toBeVisible();

  // CSS selector
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  // XPath
  await page
    .locator(
      'xpath=//div[contains(@class,"inventory_item")][.//div[contains(@class,"inventory_item_name") and normalize-space()="Sauce Labs Bike Light"]]//button'
    )
    .click();

  //getByRole locator
  const boltTShirt = page.locator('.inventory_item').filter({
    hasText: 'Sauce Labs Bolt T-Shirt',
  });
  await boltTShirt.getByRole('button', { name: 'Add to cart' }).click();

  // Capture the names and prices
  const productsShownOnInventory = [];
  for (const product of products) {
    const inventoryItem = page.locator('.inventory_item').filter({
      hasText: product.name,
    });

    productsShownOnInventory.push({
      name: await inventoryItem.locator('.inventory_item_name').innerText(),
      price: await inventoryItem.locator('.inventory_item_price').innerText(),
    });
  }

  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('3');

  await page.locator('[data-test="shopping-cart-link"]').click();

  // Verify each selected product's name and price
  for (const product of productsShownOnInventory) {
    const cartItem = page.locator('.cart_item').filter({ hasText: product.name });
    await expect(cartItem.getByText(product.name, { exact: true })).toBeVisible();
    await expect(cartItem.locator('.inventory_item_price')).toHaveText(product.price);
  }

  // Remove one product
  const bikeLight = page.locator('.cart_item').filter({
    hasText: 'Sauce Labs Bike Light',
  });
  await bikeLight.getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('.cart_item')).toHaveCount(2);
  await expect(page.getByText('Sauce Labs Bike Light', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByLabel('First Name').fill('Playwright');
  await page.getByLabel('Last Name').fill('Student');
  await page.getByLabel('Zip/Postal Code').fill('110111');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Checkout: Overview', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.getByText('Thank you for your order!', { exact: true })).toBeVisible();
  await expect(page.getByText('Your order has been dispatched, and will arrive just as fast as the pony can get there!', { exact: true })).toBeVisible();
});
