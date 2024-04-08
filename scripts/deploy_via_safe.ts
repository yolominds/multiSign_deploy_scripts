import { ethers, network } from "hardhat";
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

async function main() {
    const safeAddress = "0x5B09dB51814cBfaa5Fe3ecf842559C920BdBBc0e";
    const serviceUrl = "https://safe-transaction.sepolia.gnosis.io";
    const chainId: bigint = 11155111n; // SEPOLIA
    const rpcUrl: string = "https://eth-sepolia.g.alchemy.com/v2/doDEH2L2UI3MQ4M0LveZj1HwVDMDyWi3";
    const privateKey: string = "d4249acf332177ddd9c18385b9c821ec1015c27454bfc9a7ecb858fe14918a80";

    // 初始化 Ethers 和 Safe 服务客户端
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const safeOwner = new ethers.Wallet(privateKey, provider)
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
    const safeTransactionData: MetaTransactionData = {
        to: destination,
        data: deployTransaction.data!,
        value: '0'
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
