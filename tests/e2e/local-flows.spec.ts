import { expect, test } from "@playwright/test";

test("serves the seeded catalog from local Supabase", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: "Villa Amanzi" })).toBeVisible();
  await page.goto("/en/villas/villa-saan");
  await expect(page.getByRole("heading", { name: "Villa Saan" })).toBeVisible();
});

test("creates a local guest session and enforces role routing", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.request.post("/api/local/session", { data: { persona: "guest" } });
  expect(response.ok()).toBe(true);
  await page.goto("/en/trips");
  await expect(page.getByRole("heading", { name: "My trips" })).toBeVisible();
  await page.goto("/en/partner/apply");
  await expect(page.getByRole("heading", { name: "Apply to become a partner" })).toBeVisible();
  await expect(page).toHaveURL(/\/en\/partner\/apply/);
  await page.goto("/en/admin");
  await expect(page).toHaveURL(/\/en\/trips/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("partner View opens the RLS-protected booking request detail", async ({ page }) => {
  const guestSession = await page.request.post("/api/local/session", { data: { persona: "guest" } });
  expect(guestSession.ok()).toBe(true);
  const checkIn = new Date();
  checkIn.setUTCDate(checkIn.getUTCDate() + 45);
  const checkOut = new Date(checkIn);
  checkOut.setUTCDate(checkOut.getUTCDate() + 3);
  const bookingRequest = await page.request.post("/api/booking-requests", {
    data: {
      villaId: "b0000000-0000-0000-0000-000000000002",
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      guests: 4,
      locale: "en",
    },
  });
  expect(bookingRequest.ok()).toBe(true);
  const created = await bookingRequest.json();

  const partnerSession = await page.request.post("/api/local/session", { data: { persona: "partner" } });
  expect(partnerSession.ok()).toBe(true);
  await page.goto("/en/partner");
  const view = page.locator(`a[href="/en/partner/requests/${created.id}"]`);
  await expect(view).toBeVisible();
  await view.click();
  await expect(page).toHaveURL(new RegExp(`/en/partner/requests/${created.id}$`));
  await expect(page.getByRole("heading", { name: "Villa Saan" })).toBeVisible();
  await expect(page.getByText("guest@findvillas.local")).toBeVisible();

  const villa = await page.request.post("/api/partner/villas", {
    data: {
      name: "Local Compliance Villa",
      destinationId: "a0000000-0000-0000-0000-000000000001",
      legalPath: "non_hotel_notification",
      bedrooms: 4,
      bathrooms: 4,
      maxGuests: 8,
      baseRateThb: 25000,
      latitude: 7.95,
      longitude: 98.3,
      areaEn: "Kamala, Phuket",
      areaTh: "กมลา ภูเก็ต",
      address: { line1: "1 Test Road", district: "Kathu", province: "Phuket", postalCode: "83150" },
      descriptionEn: "A local villa used to verify the compliance workflow.",
      descriptionTh: "วิลล่าสำหรับทดสอบขั้นตอนการตรวจสอบในระบบท้องถิ่น",
      amenities: ["Pool", "Fire extinguishers"],
    },
  });
  expect(villa.ok()).toBe(true);
  const createdVilla = await villa.json();
  await page.goto(`/en/partner/compliance/${createdVilla.complianceCaseId}`);
  await expect(page.getByRole("heading", { name: "Local Compliance Villa" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Legal and safety evidence" })).toBeVisible();
});
