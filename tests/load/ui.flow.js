module.exports = {
  homeFlow: async (page) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForURL(/\/login/);
    await page.getByText("몰입이 시작되는").waitFor({ timeout: 5000 });
  },
};
