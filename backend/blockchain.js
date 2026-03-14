const { ethers } = require("ethers");
const contractData = require("./abi/HospitalRBAC.json");

// Hardhat local provider
const provider = new ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:8545"
);

// Paste your deployed contract address here
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ABI from artifact
const abi = contractData.abi;

const contract = new ethers.Contract(
  contractAddress,
  abi,
  provider
);

module.exports = contract;