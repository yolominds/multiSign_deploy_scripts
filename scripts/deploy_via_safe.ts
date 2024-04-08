import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'

async function main() {
  const safeAddress = "0x5B09dB51814cBfaa5Fe3ecf842559C920BdBBc0e";
  const rpcUrl = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID";
  const privateKey = "YOUR_PRIVATE_KEY"; // Use environment variables or secure ways to handle private keys
  const serviceUrl = "https://safe-transaction.sepolia.gnosis.io";

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const safeOwner = provider.getSigner(0);
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner
  })

  // Load the existing Safe
  const safeFactory = await SafeFactory.create({ ethAdapter })
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })

  // Compile and prepare the contract deployment data
  const TestContractFactory = await ethers.getContractFactory("TestContract");
  const deployTransaction = TestContractFactory.getDeployTransaction();

  // Create a Safe transaction
  const safeTransaction = await safeSdk.createTransaction({
    to: ethers.ZeroAddress,
    data: deployTransaction.data!,
    value: deployTransaction.value || '0',
  });

  // Sign the transaction with the Safe owners
  await safeSdk.signTransaction(safeTransaction);

  // Initialize the Safe service client
  const safeService = new SafeApiKit({ chainId })

  // Propose the transaction to the Safe transaction service
  await safeService.proposeTransaction({
    safeAddress,
    safeTransaction.data,
    safeTxHash: await safeSdk.getTransactionHash(safeTransaction),
    senderAddress: signer.address
  });

  console.log("Transaction has been proposed to the Safe");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
