const { ethers } = require("hardhat");

async function main() {
  const pindownContract = await ethers.getContractFactory("Pindown");

  // here we deploy the contract
  const deployedpindownContract = await pindownContract.deploy();

  // Wait for it to finish deploying
  await deployedpindownContract.deployed();

  // print the address of the deployed contract
  console.log("Pindown Contract Address:", deployedpindownContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
