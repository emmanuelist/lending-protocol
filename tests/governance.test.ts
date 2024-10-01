import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

describe("governance", () => {
  it("allows users to create proposals", () => {
    const description = "Test Proposal";
    const stake = Cl.uint(100000000); // Example stake value
    const createProposal = simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description), stake],
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

  it("allows users to vote on proposals", () => {
    const description = "Test Proposal";
    const stake = Cl.uint(100000000); // Example stake value
    simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description), stake],
      wallet1
    );
    const vote = simnet.callPublicFn(
      "governance",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet2
    );
    expect(vote.result).toBeOk(Cl.bool(true));
    const userVote = simnet.callReadOnlyFn(
      "governance",
      "get-user-vote",
      [Cl.principal(wallet2), Cl.uint(1)],
      wallet2
    );
    expect(userVote.result).toBe(Cl.bool(true));
  });

  it("prevents users from voting twice on the same proposal", () => {
    const description = "Test Proposal";
    const stake = Cl.uint(100000000); // Example stake value
    simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description), stake],
      wallet1
    );
    simnet.callPublicFn(
      "governance",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet2
    );
    const secondVote = simnet.callPublicFn(
      "governance",
      "vote",
      [Cl.uint(1), Cl.bool(false)],
      wallet2
    );
    expect(secondVote.result).toBeErr(Cl.uint(102)); // ERR_ALREADY_VOTED
  });

  it("allows ending proposals after the voting period", () => {
    const description = "Test Proposal";
    const stake = Cl.uint(100000000); // Example stake value
    simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description), stake],
      wallet1
    );
    simnet.callPublicFn(
      "governance",
      "vote",
      [Cl.uint(1), Cl.bool(true)],
      wallet2
    );

    // Simulate time passing
    simnet.mineEmptyBlocks(1441); // More than the voting period (1440 blocks)

    const endProposal = simnet.callPublicFn(
      "governance",
      "end-proposal",
      [Cl.uint(1)],
      wallet1
    );
    expect(endProposal.result).toBeOk(Cl.stringAscii("passed"));
  });

  it("prevents ending proposals before the voting period is over", () => {
    const description = "Test Proposal";
    const stake = Cl.uint(100000000); // Example stake value
    simnet.callPublicFn(
      "governance",
      "create-proposal",
      [Cl.stringAscii(description), stake],
      wallet1
    );
    const endProposal = simnet.callPublicFn(
      "governance",
      "end-proposal",
      [Cl.uint(1)],
      wallet1
    );
    expect(endProposal.result).toBeErr(Cl.uint(103)); // ERR_PROPOSAL_ENDED
  });

  it("allows owner to set minimum proposal stake", () => {
    const newStake = 200000000; // 200 STX
    const setStake = simnet.callPublicFn(
      "governance",
      "set-min-proposal-stake",
      [Cl.uint(newStake)],
      deployer
    );
    expect(setStake.result).toBeOk(Cl.uint(newStake));
  });

  it("allows owner to set voting period", () => {
    const newPeriod = 2880; // ~20 days
    const setPeriod = simnet.callPublicFn(
      "governance",
      "set-voting-period",
      [Cl.uint(newPeriod)],
      deployer
    );
    expect(setPeriod.result).toBeOk(Cl.uint(newPeriod));
  });

  it("prevents unauthorized access to admin functions", () => {
    const setStake = simnet.callPublicFn(
      "governance",
      "set-min-proposal-stake",
      [Cl.uint(200000000)],
      wallet1
    );
    expect(setStake.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });
});