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
});