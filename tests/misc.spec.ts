import { test, expect } from "playwright-test-coverage";

test("not found page", async ({ page }) => {
  await page.goto("http://localhost:5173/404");
  await expect(page.getByRole("main")).toContainText(
    "Please try another page."
  );
});

test("docs", async ({ page }) => {
  await page.route("*/**/api/docs", async (route) => {
    const docsRes = {
      endpoints: [
        {
          requiresAuth: false,
          method: "GET",
          path: "/api/order/menu",
          description: "Something",
          example: "GET /api/order/menu",
          response: {},
        },
        {
          requiresAuth: true,
          method: "PUT",
          path: "/api/order/menu",
          description: "Something else",
          example: "PUT /api/order/menu",
          response: {},
        },
      ],
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: docsRes });
  });
  await page.goto("http://localhost:5173/docs");
  await expect(page.getByRole("main")).toContainText("JWT Pizza API");
});

test("about", async ({ page }) => {
  await page.goto("http://localhost:5173/about");
  await expect(page.getByRole("main")).toContainText("The secret sauce");
});
