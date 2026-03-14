require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: {
        count: 10  // change this to any number (1000, 10000, etc)
      }
    }
  }
};
