# Inherit Contract Project

## Overview

The **Inherit Contract Project** provides a blockchain-based solution for inheritance management. This project includes a smart contract that ensures a seamless and secure transition of ownership after a period of owner inactivity. It is fully equipped with a comprehensive test suite.

---

## Features

### 🛡️ Ownership Management

- **Designate an Heir**: The owner can set an heir to take ownership in case of prolonged inactivity.
- **Ownership Transfer**: The heir can claim ownership if the owner has been inactive for more than 30 days.
- **Event Transparency**: All critical actions are logged with events for on-chain transparency.

### 💰 Fund Management

- **Withdraw Funds**: The owner can withdraw funds at any time.
- **Heir Update**: The owner can update the designated heir if required.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (>=16.x)
- **Hardhat**: Ethereum development environment

---

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-repo/inherit-contract.git
   cd inherit-contract
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Compile the Contract**

   ```bash
   npx hardhat compile
   ```

4. **Run Tests**
   - Standard tests:

     ```bash
     npx hardhat test
     ```

   - Coverage report:

     ```bash
     SOLIDITY_COVERAGE=true npx hardhat coverage
     ```

---

## Testing

### Run All Tests

```bash
npx hardhat test
```

### Run Coverage Tests

```bash
SOLIDITY_COVERAGE=true npx hardhat coverage
```

---

## Deployment

Deploy the contract to Holesky testnet using Hardhat Ignition:

```bash
npx hardhat ignition deploy ./ignition/modules/InheritContract.ts --network holesky
```

### Contract Verification

Verify the deployed contract on Holesky testnet:

```bash
npx hardhat ignition verify chain-17000
```

### Deployed Contract

The contract is deployed and verified on Holesky testnet at:
[0x91a5312dA4001294339B2eb69d1CE442Ce26e82a](https://holesky.etherscan.io/address/0x91a5312dA4001294339B2eb69d1CE442Ce26e82a#code)

---

## Live Checks

### Solidity Coverage

Check contract coverage with:

```bash
SOLIDITY_COVERAGE=true npx hardhat coverage
```


File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
 contracts/           |      100 |      100 |      100 |      100 |                |
  InheritContract.sol |      100 |      100 |      100 |      100 |                |
All files             |      100 |      100 |      100 |      100 |                |

---
