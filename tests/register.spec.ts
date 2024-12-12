import { test, expect } from "playwright-test-coverage";
import { faker } from "@faker-js/faker";

test("register a new user", async ({ page }) => {
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
  const name = `${user.firstName} ${user.lastName}`;
  const alias = `${user.firstName[0]}${user.lastName[0]}`;
  const email = faker.internet.email(user);

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").fill(name);
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder("Password").fill(faker.internet.password());
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: alias }).click();
  await expect(page.getByRole("main")).toContainText(name);
  await expect(page.getByRole("main")).toContainText(email);
  await page.getByRole("link", { name: "Logout" }).click();
});
