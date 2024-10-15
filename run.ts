//const RPC_URL = 'https://moonbeam.api.onfinality.io/public'
const RPC_URL = 'http://127.0.0.1:8545'
import { ethers } from "ethers";

// Define your list of addresses to monitor
const monitoredAddresses = [
  "0xAddress1",
  "0xAddress2",
  "0xAddress3",
];

// ERC-20 contract ABI (standard)
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// List of ERC-20 token contract addresses
const tokenList = [
  "0xTokenAddress1", // Example: DAI
  "0xTokenAddress2", // Example: USDC
  "0xTokenAddress3", // Example: LINK
];

// Connect to an Ethereum RPC provider (Infura, Alchemy, or your own node)
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Function to get ERC-20 token balance for a given address and token
async function getTokenBalance(address: string, tokenAddress: string) {
  try {
    // Create a contract instance for the token
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

    // Fetch the balance of the address for the specific token
    const balance = await tokenContract.balanceOf(address);

    // Get the token's decimals and symbol for display purposes
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    // Format the balance with the correct number of decimals
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    console.log(`Token: ${symbol}, Balance: ${formattedBalance}`);
  } catch (error) {
    console.error(`Error fetching token balance for address ${address} on token ${tokenAddress}:`, error);
  }
}

// Function to get the balance of all tokens for a specific address
async function getAllTokenBalances(address: string) {
  console.log(`Fetching token balances for address: ${address}`);

  for (const tokenAddress of tokenList) {
    await getTokenBalance(address, tokenAddress);
  }
}

// Function to monitor pending transactions
async function monitorPendingTransactions() {
  provider.on("pending", async (txHash: string) => {
    try {
      // Get transaction details using the transaction hash
      const tx = await provider.getTransaction(txHash);

      // If transaction exists and the sender's address is monitored
      if (tx && monitoredAddresses.includes(tx.from)) {
        console.log(`Pending transaction from monitored address: ${tx.from}`);
        console.log(`Transaction hash: ${tx.hash}`);
        console.log(`To: ${tx.to}`);
        console.log(`Value: ${ethers.utils.formatEther(tx.value.toString())} ETH`);

        // Get the balances of all ERC-20 tokens for the sender address
        await getAllTokenBalances(tx.from);
      }
    } catch (error) {
      console.error(`Error fetching transaction: ${error}`);
    }
  });
}

// Start monitoring pending transactions
monitorPendingTransactions();
console.log("Listening for pending transactions from monitored addresses...");


