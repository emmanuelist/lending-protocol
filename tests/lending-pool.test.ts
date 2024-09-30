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

  it("allows users to borrow STX", () => {
    const depositAmount = 1000000;
    const borrowAmount = 500000;
    simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(depositAmount)],
      wallet1
    );
    const borrow = simnet.callPublicFn(
      "lending-pool",
      "borrow",
      [Cl.uint(borrowAmount)],
      wallet1
    );
    expect(borrow.result).toBeOk(Cl.uint(borrowAmount));
    const borrowBalance = simnet.callReadOnlyFn(
      "lending-pool",
      "get-borrow",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(borrowBalance.result).toBeOk(Cl.uint(borrowAmount));
  });

  it("allows users to repay loans", () => {
    const depositAmount = 1000000;
    const borrowAmount = 500000;
    const repayAmount = 250000;
    simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(depositAmount)],
      wallet1
    );
    simnet.callPublicFn(
      "lending-pool",
      "borrow",
      [Cl.uint(borrowAmount)],
      wallet1
    );
    const repay = simnet.callPublicFn(
      "lending-pool",
      "repay",
      [Cl.uint(repayAmount)],
      wallet1
    );
    expect(repay.result).toBeOk(Cl.uint(repayAmount));
    const borrowBalance = simnet.callReadOnlyFn(
      "lending-pool",
      "get-borrow",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(borrowBalance.result).toBeOk(Cl.uint(borrowAmount - repayAmount));
  });

  it("prevents borrowing more than allowed by collateral ratio", () => {
    const depositAmount = 1000000;
    const borrowAmount = 800000; // This should be too high given the 150% collateral ratio
    simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(depositAmount)],
      wallet1
    );
    const borrow = simnet.callPublicFn(
      "lending-pool",
      "borrow",
      [Cl.uint(borrowAmount)],
      wallet1
    );
    expect(borrow.result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_COLLATERAL
  });

  it("allows owner to set collateral ratio", () => {
    const newRatio = 200; // 200%
    const setRatio = simnet.callPublicFn(
      "lending-pool",
      "set-collateral-ratio",
      [Cl.uint(newRatio)],
      deployer
    );
    expect(setRatio.result).toBeOk(Cl.uint(newRatio));
  });

  it("allows owner to set interest rate", () => {
    const newRate = 10; // 10%
    const setRate = simnet.callPublicFn(
      "lending-pool",
      "set-interest-rate",
      [Cl.uint(newRate)],
      deployer
    );
    expect(setRate.result).toBeOk(Cl.uint(newRate));
  });

  it("allows owner to pause and unpause the contract", () => {
    const pause = simnet.callPublicFn(
      "lending-pool",
      "toggle-pause",
      [],
      deployer
    );
    expect(pause.result).toBeOk(Cl.bool(true));
    const deposit = simnet.callPublicFn(
      "lending-pool",
      "deposit",
      [Cl.uint(1000000)],
      wallet1
    );
    expect(deposit.result).toBeErr(Cl.uint(104)); // ERR_PAUSED
    const unpause = simnet.callPublicFn(
      "lending-pool",
      "toggle-pause",
      [],
      deployer
    );
    expect(unpause.result).toBeOk(Cl.bool(false));
  });

  it("prevents unauthorized access to admin functions", () => {
    const setRatio = simnet.callPublicFn(
      "lending-pool",
      "set-collateral-ratio",
      [Cl.uint(200)],
      wallet1
    );
    expect(setRatio.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });
});
