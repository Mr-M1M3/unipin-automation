import type { Coupon } from "../types/Coupon.type.js";
import { Result } from "../types/Result.type.js";
export default function parse_coupon(coupon: string): Result<Coupon, unknown> {
  if (!coupon) {
    return {
      result: "error",
      cause: "expected at least 1 argument, got 0",
      original: new Error("expected at least 1 argument, got 0"),
    };
  }
  coupon = coupon.toLowerCase();
  let to_return: Coupon = { code: {} } as Coupon;
  let code_parts = coupon.split(" ");
  if (code_parts.length !== 2) {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }
  let [sl, pin] = code_parts;
  //   checks serial key format: BDMB-L-S-00001234 or, UPBD-L-S-00001234
  let sl_parts = sl.split("-");
  if (sl_parts.length !== 4) {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }
  //   determines if it is a voucher or gift card
  if (sl_parts[0] == "bdmb") {
    to_return.kind = "voucher";
  } else if (sl_parts[0] == "upbd") {
    to_return.kind = "gift";
  } else {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }
  //   extracts sl 1
  if (sl_parts[1].length !== 1) {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }
  to_return.code.sl_1 = sl_parts[1];

  if (sl_parts[2] !== "s") {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }

  //   checks serial no. 2
  if (sl_parts[3].length !== 8) {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  } else {
    to_return.code.sl_2 = sl_parts[3];
  }

  //   extracts pin no; format: 1234-5678-9012-3456
  let pin_parts = pin.split("-");
  if (pin_parts.length < 4) {
    return {
      result: "error",
      cause: "invalid coupon",
      original: new Error("invalid coupon"),
    };
  }
  let pins: string[] = [];
  try {
    pin_parts.forEach((part, index) => {
      if (part.length !== 4) {
        throw {
          result: "error",
          cause: "invalid coupon",
          original: new Error("invalid coupon"),
        };
      }
      pins.push(part);
    });
    to_return.code.pin_1 = pins[0];
    to_return.code.pin_2 = pins[1];
    to_return.code.pin_3 = pins[2];
    to_return.code.pin_4 = pins[3];
  } catch (err) {
    return err;
  }
  return {
    result: "success",
    data: to_return,
  };
}
