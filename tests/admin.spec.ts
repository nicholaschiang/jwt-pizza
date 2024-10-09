import { test, expect } from "playwright-test-coverage";

test("create a franchise", async ({ page }) => {
  const loginRes = {
    user: {
      id: 3,
      name: "Kai Chen",
      email: "d@jwt.com",
      roles: [{ role: "admin" }],
    },
    token: "abcdef",
  };

  const franchiseRes = [
    {
      id: 2,
      name: "LotaPizza",
      stores: [
        { id: 4, name: "Lehi", totalRevenue: 100 },
        { id: 5, name: "Springville", totalRevenue: 50 },
        { id: 6, name: "American Fork", totalRevenue: 150 },
      ],
      admins: [loginRes.user],
    },
  ];

  await page.route("*/**/api/franchise", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route(`*/**/api/franchise/${loginRes.user.id}`, async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto("/login");

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Go to franchise page
  await page.getByRole("link", { name: "Admin" }).first().click();
  await page.getByRole("button", { name: "Add Franchise" }).click();
});
