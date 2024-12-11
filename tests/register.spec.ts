import { test, expect } from "playwright-test-coverage";

test("register a new user", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").fill("John Doe");
  await page.getByPlaceholder("Email address").fill("john.doe@example.com");
  await page.getByPlaceholder("Password").fill("password");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: "JD" }).click();
  await expect(page.getByRole("main")).toContainText("John Doe");
  await expect(page.getByRole("main")).toContainText("john.doe@example.com");
  await page.getByRole("link", { name: "Logout" }).click();
});
