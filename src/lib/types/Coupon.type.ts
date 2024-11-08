export type Coupon = {
  kind: "voucher" | "gift";
  code: {
    sl_1: string;
    sl_2: string;
    pin_1: string;
    pin_2: string;
    pin_3: string;
    pin_4: string;
  };
};