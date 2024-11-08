import * as playwrightExtra from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { Result } from "./lib/types/Result.type.js";
import parse_coupon from "./lib/utils/coupon-parser.js";
import { TopupArg } from "./lib/types/TopupArg.type.js";

playwrightExtra.chromium.use(stealth());
export async function topup(opt: TopupArg): Promise<Result<unknown, unknown>> {
  const parsed_coupon_result = parse_coupon(opt.coupon);
  if (parsed_coupon_result.result === "error") {
    return parsed_coupon_result;
  }
  const browser = await playwrightExtra.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const web_page = await context.newPage();
  await web_page.goto("https://shop.garena.my", { waitUntil: "load" });
  // click to close dialog
  await web_page
    .getByRole("dialog")
    .click({ position: { x: Math.random() * 100, y: Math.random() * 100 } });
  // click ff btn
  await web_page.getByRole("radio").getByText("Free Fire").click();
  await web_page.waitForTimeout(Math.random() * 1000);
  // fillup player uid
  await web_page.locator("input.form-input").fill(opt.uid);
  await web_page.waitForTimeout(Math.random() * 1000);
  // click login
  await web_page.locator('button[type="submit"]', { hasText: "Login" }).click();
  await web_page.waitForTimeout(Math.random() * 1000);
  // check if uid is valid
  let is_invalid_uid = await web_page
    .getByText("Invalid Player ID")
    .isVisible();
  if (is_invalid_uid) {
    await context.close();
    await browser.close();
    return {
      result: "error",
      cause: "invalid uid",
      original: new Error("invalid uid"),
    };
  }
  let is_another_region_uid = await web_page
    .getByText("Account region does not match the shop region.")
    .isVisible();
  if (is_another_region_uid) {
    await context.close();
    await browser.close();
    return {
      result: "error",
      cause: "uid doesn't belong to this region",
      original: new Error("uid doesn't belong to this region"),
    };
  }
  // click proceed to payment
  await web_page.getByText("Proceed to Payment").click();
  await web_page.waitForURL(
    /^https:\/\/www\.unipin\.com\/unibox\/select_denom\/.*$/,
    { waitUntil: "load" }
  );
  // Select diamonds
  try {
    await web_page
      .locator("div.payment-denom-button")
      .locator("div", { hasText: `${opt.amount} Diamond` })
      .click({ timeout: 3000 });
    await web_page.waitForURL(/^https:\/\/www\.unipin\.com\/unibox\/d\/.*$/, {
      waitUntil: "load",
    });
  } catch (err) {
    await context.close();
    await browser.close();
    if (
      err.message.includes(
        "waiting for locator('div.payment-denom-button').locator('div').filter("
      )
    ) {
      return {
        result: "error",
        cause: "invalid amount",
        original: err,
      };
    } else {
      return {
        result: "error",
        cause: "unknown",
        original: err,
      };
    }
  }
  // pay using uc
  // expand
  await web_page.locator('button[data-target="#VOUCHER_panel"]').click();
  await web_page.waitForTimeout(Math.random() * 1000);
  // click unipin voucher
  if (parsed_coupon_result.data.kind === "voucher") {
    await web_page.getByText("UniPin Voucher").click();
  }else{
    await web_page.getByText("UP Gift Card").click();
  }
  await web_page.waitForURL(/^https:\/\/www\.unipin\.com\/unibox\/c\/.*$/, {
    waitUntil: "load",
  });
  // fillup code and pin
  await web_page
    .locator('input[name="serial_1"]')
    .fill(parsed_coupon_result.data.code.sl_1);
  await web_page.waitForTimeout(Math.random() * 1000);
  await web_page
    .locator('input[name="serial_2"]')
    .fill(parsed_coupon_result.data.code.sl_2);
  await web_page.waitForTimeout(Math.random() * 1000);
  await web_page
    .locator('input[name="pin_1"]')
    .fill(parsed_coupon_result.data.code.pin_1);
  await web_page.waitForTimeout(Math.random() * 1000);
  await web_page
    .locator('input[name="pin_2"]')
    .fill(parsed_coupon_result.data.code.pin_2);
  await web_page.waitForTimeout(Math.random() * 1000);
  await web_page
    .locator('input[name="pin_3"]')
    .fill(parsed_coupon_result.data.code.pin_3);
  await web_page.waitForTimeout(Math.random() * 1000);
  await web_page
    .locator('input[name="pin_4"]')
    .fill(parsed_coupon_result.data.code.pin_4);
  await web_page.waitForTimeout(Math.random() * 1000);
  // click confirm button
  await web_page.locator('input[type="submit"][value="Confirm"]').click();
  // screenshot
  await web_page.screenshot({
    path: "screenshots/unipin.png",
    fullPage: true,
  });
  // cleanup
  await context.close();
  await browser.close();
  return {
    result: "success",
    data: {},
  };
}
// example call
topup({
  uid: "728027523",
  amount: 25,
  coupon: "UPBD-L-S-00001234 1234-5678-9012-3456",
}).then((res) => {
  if (res.result == "error") {
    console.log(`${res.result}: ${res.cause}`);
    return;
  }
  console.log("success");
});
