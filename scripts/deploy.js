async function main() {
  // Get the ContractFactory and signers from the Hardhat runtime
  
  const litProtocol = hre.ethers.secureAccount.deployContract();
  console.log('Deploying SecureAccount...');
  await litProtocol.waitForDeployment();

  console.log('SecureAccount contract deployed to:', litProtocol.address);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });