import { ethers } from 'ethers';

const abi = [
	'function balanceOf(address) view returns (uint)',
	'function transfer(address to, uint value) returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint value)'
  ];

const blockNumber = 3580732;
const rpcUrl = 'https://rpc.sepolia.org/';

async function getTransactionDetails(blockNumber) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const block = await provider.getBlock(blockNumber);
  const transactionHashes = block.transactions;
  const transactionPromises = transactionHashes.map(hash => provider.getTransaction(hash));
  const transactions = await Promise.all(transactionPromises);
  const ethTransfers = transactions.filter(tx => {
    if (tx.value > (0)) {
      return true;
    }
  });
  const erc20Transfers = transactions.filter(tx => {
    const data = tx.data || '0x';
    const functionSignature = data.slice(0, 10);
    return functionSignature === '0xa9059cbb';
  });
  return {ethTransfers, erc20Transfers};
}

getTransactionDetails(blockNumber)
  .then(transfers => {
    console.log('ETH and ERC20 transfers:', transfers);
  })
  .catch(error => {
    console.error('Error:', error);
  });