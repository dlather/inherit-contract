import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const InheritContract = buildModule("InheritContract", (m) => {
  const owner = m.getParameter("owner", ZERO_ADDRESS);
  const heir = m.getParameter("heir", ZERO_ADDRESS);
  const lastWithdrawalTimeStamp = m.getParameter("lastWithdrawalTimeStamp", 0);

  const inheritContract = m.contract("InheritContract", [heir]);

  return { inheritContract };
});

export default InheritContract;
