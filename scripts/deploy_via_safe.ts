import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

async function main() {
    const safeAddress = "0x5B09dB51814cBfaa5Fe3ecf842559C920BdBBc0e";
    const rpcUrl = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID";
    const privateKey = "YOUR_PRIVATE_KEY"; // Use environment variables or secure ways to handle private keys
    const serviceUrl = "https://safe-transaction.sepolia.gnosis.io";
    const chainId: bigint = 11155111n; // SEPOLIA

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const safeOwner = ethers.Wallet.createRandom(); // TODO: replace to owner wallet
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
    const destination = ethers.ZeroAddress
    const amount = ethers.parseUnits('0', 'ether').toString()
    const safeTransactionData: MetaTransactionData = {
        to: destination,
        data: deployTransaction.data!,
        value: amount
    }
    // Create a Safe transaction with the provided parameters
    const safeTransaction = await safeSdk.createTransaction({ transactions: [safeTransactionData] })

    // Sign the transaction with the Safe owners
    await safeSdk.signTransaction(safeTransaction);
    
    // Initialize the Safe service client
    const safeService = new SafeApiKit({ chainId })

    // Propose the transaction to the Safe transaction service
    const safeTxHash = await safeOwner.getTransactionHash(safeTransaction);
    const senderAddress = await safeOwner.getAddress();
    const senderSignature = await safeOwner.signHash(safeTxHash)
    await safeService.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: senderSignature.data,
      })

    console.log("Transaction has been proposed to the Safe");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
