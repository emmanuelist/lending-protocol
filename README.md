# Stacks Lending Protocol

A decentralized finance (DeFi) application built on the Stacks blockchain. This protocol allows users to deposit STX tokens as collateral, borrow against their collateral, and repay loans with interest. Additionally, the protocol features governance and price oracle contracts for decentralized decision-making and price feed integration.

## Project Structure

```bash
lending-protocol/
├── contracts/
│   ├── lending-pool.clar
│   ├── governance.clar
│   └── oracle.clar
├── tests/
│   ├── lending-pool_test.ts
│   ├── governance_test.ts
│   └── oracle_test.ts
└── README.md
├── Clarinet.toml
├── LICENSE
├── package.json
├── settings
│   ├── Devnet.toml
│   ├── Mainnet.toml
│   └── Testnet.toml
├── tsconfig.json
└── vitest.config.js
```

### **Contracts Overview**

1. **lending-pool.clar**: Manages user deposits, loans, and repayments, while enforcing collateral ratios to ensure the protocol’s solvency.
2. **governance.clar**: Allows users to propose and vote on changes to protocol parameters such as interest rates and collateral ratios.

3. **oracle.clar**: Sets and retrieves the price of STX, which is used to calculate the collateral value.

## Key Features

- **Collateral Deposits**: Users can deposit STX tokens as collateral.
- **Borrowing**: Users can borrow against their deposited collateral, subject to the collateral ratio.
- **Loan Repayments**: Users can repay loans at any time.
- **Interest Accumulation**: Loans accumulate interest over time, calculated per block.
- **Decentralized Governance**: Protocol parameters can be adjusted via community governance.
- **Price Oracle Integration**: An external price oracle ensures that loans are based on up-to-date STX prices.

## How It Works

### **Collateralization**

Users must maintain a minimum collateralization ratio of **150%** (defined by `min-collateral-ratio`) to borrow funds. The current collateral and loan values are verified when users attempt to withdraw or borrow more tokens, ensuring that the system remains solvent.

### **Interest Calculation**

Interest on borrowed funds is calculated based on an annual interest rate (default: **5%**), which accumulates per block until the loan is repaid.

### **Governance**

The governance model allows users to submit proposals and vote on changes to key protocol parameters. Only the contract owner can close proposals, but any user can create proposals and participate in voting.

### **Oracle**

The `oracle.clar` contract manages STX price data, which is critical for determining the value of collateral. Only the contract owner has permission to update the price data.

## Getting Started

### **Prerequisites**

Before you begin, ensure you have the following installed:

- [Clarity CLI](https://docs.stacks.co/smart-contracts/clarity-cli)
- [Stacks Blockchain](https://stacks.co)
- Node.js (for running tests)

### **Setup**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/emmanuelist/lending-protocol.git
   cd lending-protocol
   ```

2. **Install dependencies**:

   Navigate to the `tests` directory and install the required dependencies:

   ```bash
   cd tests
   npm install
   ```

### **Running Tests**

Unit tests for all contracts are included. To run the tests, use the following command:

```bash
npm test
```

Tests include scenarios for depositing, borrowing, withdrawing, repaying loans, governance actions (proposals and voting), and oracle price updates.

## Contract Functions Overview

### **lending-pool.clar**

| Function                 | Type      | Description                                                |
| ------------------------ | --------- | ---------------------------------------------------------- |
| `deposit`                | Public    | Allows users to deposit STX as collateral.                 |
| `withdraw`               | Public    | Allows users to withdraw collateral if conditions are met. |
| `borrow`                 | Public    | Allows users to borrow against their collateral.           |
| `repay`                  | Public    | Allows users to repay borrowed funds.                      |
| `get-collateral`         | Read-only | Retrieves the collateral amount for a user.                |
| `get-debt`               | Read-only | Retrieves the debt amount for a user.                      |
| `check-collateral-ratio` | Read-only | Verifies if a user's collateral is sufficient.             |

### **governance.clar**

| Function          | Type      | Description                                           |
| ----------------- | --------- | ----------------------------------------------------- |
| `create-proposal` | Public    | Allows users to create a new proposal.                |
| `vote`            | Public    | Allows users to vote on proposals.                    |
| `close-proposal`  | Public    | Closes a proposal and marks it as passed or rejected. |
| `get-proposal`    | Read-only | Retrieves details of a specific proposal.             |
| `get-user-vote`   | Read-only | Checks if a user has voted on a specific proposal.    |

### **oracle.clar**

| Function        | Type      | Description                                             |
| --------------- | --------- | ------------------------------------------------------- |
| `set-stx-price` | Public    | Allows the contract owner to set the current STX price. |
| `get-stx-price` | Read-only | Retrieves the current STX price.                        |

## Security Considerations

- **Collateralization**: A minimum collateralization ratio of **150%** is enforced to protect against default risk.
- **Interest Calculation**: The protocol uses per-block interest accrual to ensure fairness.
- **Governance**: While any user can vote on proposals, only the contract owner can finalize and close proposals to prevent premature termination.

## Roadmap

- **Phase 1**: Complete the core lending protocol and governance setup.
- **Phase 2**: Integrate with external price oracles for real-time STX pricing.
- **Phase 3**: Optimize contracts for gas efficiency.
- **Phase 4**: Expand collateral support and enhance governance features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
