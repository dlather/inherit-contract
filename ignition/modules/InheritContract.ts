import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const TEST_HEIR_ADDRESS = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
const TEST_BALANCE = "0.000001"

const InheritContract = buildModule("InheritContract", (m) => {
  const initialHeir = process.env.CONTRACT_INITIAL_HEIR || TEST_HEIR_ADDRESS
  const inheritContract = m.contract("InheritContract", [initialHeir], {
    value: parseEther(process.env.CONTRACT_INITIAL_BALANCE || TEST_BALANCE)
  });

  return {
    inheritContract,
  };
});

export default InheritContract;
