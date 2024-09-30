import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

describe("governance", () => {
  it("allows users to create proposals", () => {
    const description = "Test Proposal";
    simnet.transferSTX(100000000, deployer, wallet1);
    const createProposal = simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description)],
      wallet1
    );
    expect(createProposal.result).toBeOk(Cl.uint(1));
    const proposalCount = simnet.callReadOnlyFn(
      "governance",
      "get-proposal-count",
      [],
      wallet1
    );
    expect(proposalCount.result).toBeOk(Cl.uint(1));
  });
});