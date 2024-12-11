import { test, expect } from "playwright-test-coverage";

test("login page", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByText("Are you new? Register instead.")
    .getByText("Register")
    .click();
  await expect(page.getByRole("main")).toContainText("Welcome to the party");
});
