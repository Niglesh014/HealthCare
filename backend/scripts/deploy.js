const hre = require("hardhat");

async function main() {

  // Get deployer wallet
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying HospitalRBAC with account:");
  console.log(deployer.address);

  console.log(
    "Account balance:",
    (await deployer.getBalance()).toString()
  );

  // Get Contract Factory
  const HospitalRBAC = await hre.ethers.getContractFactory("HospitalRBAC");

  // Deploy contract
  const hospital = await HospitalRBAC.deploy();

  // Wait until mined
  await hospital.deployed();

  console.log("HospitalRBAC deployed to:");
  console.log(hospital.address);
}

// Proper async handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });