import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

describe("oracle", () => {
  it("allows owner to set STX price", () => {
    const price = 1000000; // $1 in microstacks
    const setPrice = simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price)],
      deployer
    );
    expect(setPrice.result).toBeOk(Cl.uint(price));
  });

  it("allows anyone to read STX price", () => {
    const price = 1000000; // $1 in microstacks
    simnet.callPublicFn("oracle", "set-stx-price", [Cl.uint(price)], deployer);
    const readPrice = simnet.callReadOnlyFn(
      "oracle",
      "get-stx-price",
      [],
      wallet1
    );
    expect(readPrice.result).toBeOk(Cl.uint(price));
  });

  it("prevents non-owners from setting STX price", () => {
    const price = 1000000; // $1 in microstacks
    const setPrice = simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price)],
      wallet1
    );
    expect(setPrice.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("prevents setting invalid price (zero)", () => {
    const price = 0;
    const setPrice = simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price)],
      deployer
    );
    expect(setPrice.result).toBeErr(Cl.uint(101)); // ERR_INVALID_PRICE
  });

  it("allows reading last update block height", () => {
    const price = 1000000; // $1 in microstacks
    simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price)],
      deployer
    );
    const lastUpdate = simnet.callReadOnlyFn(
      "oracle",
      "get-last-update",
      [],
      wallet1
    );
    expect(lastUpdate.result).toBeOk(Cl.uint(simnet.blockHeight));
  });

  it("allows owner to set update interval", () => {
    const newInterval = 288; // ~2 days (assuming 1 block per 10 minutes)
    const setInterval = simnet.callPublicFn(
      "oracle",
      "set-update-interval",
      [Cl.uint(newInterval)],
      deployer
    );
    expect(setInterval.result).toBeOk(Cl.uint(newInterval));
  });

  it("prevents setting invalid update interval", () => {
    const invalidInterval = 0;
    const setInterval = simnet.callPublicFn(
      "oracle",
      "set-update-interval",
      [Cl.uint(invalidInterval)],
      deployer
    );
    expect(setInterval.result).toBeErr(Cl.uint(102)); // ERR_INVALID_INTERVAL
  });

  it("prevents updating price before interval has passed", () => {
    const price1 = 1000000; // $1 in microstacks
    const price2 = 1100000; // $1.10 in microstacks
    simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price1)],
      deployer
    );
    const setPrice = simnet.callPublicFn(
      "oracle",
      "set-stx-price",
      [Cl.uint(price2)],
      deployer
    );
    expect(setPrice.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED (due to interval not passed)
  });
});
