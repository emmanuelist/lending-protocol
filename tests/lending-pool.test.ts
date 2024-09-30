import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

describe("lending-pool", () => {
  it("allows users to deposit STX", () => {
    const amount = 1000000;
    const deposit = simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(amount)],
      wallet1
    );
    expect(deposit.result).toBeOk(Cl.uint(amount));
    const totalDeposits = simnet.callReadOnlyFn(
      "lending-pool",
      "get-total-deposits",
      [],
      wallet1
    );
    expect(totalDeposits.result).toBeOk(Cl.uint(amount));
    const balance = simnet.callReadOnlyFn(
      "lending-pool",
      "get-deposit",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(amount));
  });

  it("allows users to withdraw STX", () => {
    const depositAmount = 1000000;
    const withdrawAmount = 500000;
    simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(depositAmount)],
      wallet1
    );
    const withdraw = simnet.callPublicFn(
      "lending-pool",
      "withdraw",
      [Cl.uint(withdrawAmount)],
      wallet1
    );
    expect(withdraw.result).toBeOk(Cl.uint(withdrawAmount));
    const balance = simnet.callReadOnlyFn(
      "lending-pool",
      "get-deposit",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(balance.result).toBeOk(Cl.uint(depositAmount - withdrawAmount));
  });
});
