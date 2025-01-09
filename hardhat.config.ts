import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
require("dotenv").config();

const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || '';
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    holesky: {
      url: process.env.HOLESKY_RPC_URL,
      accounts: [ownerPrivateKey],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io",
        },
      },
    ],
  },
};

export default config;
