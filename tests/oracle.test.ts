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
});
