import { ethers } from 'ethers';

const abi = [
	'function balanceOf(address) view returns (uint)',
	'function transfer(address to, uint value) returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint value)'
  ];

const blockNumber = 3580732;
const rpcUrl = 'https://rpc.sepolia.org/';
const provider = new ethers.JsonRpcProvider(rpcUrl);

const block = await provider.getBlock(blockNumber);

const transactions = block.transactions;

const transfers = [];
	for (const txHash of transactions) {
  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);
  console.log('1 --------------------')
  if (receipt.status === 1) {
	console.log('2 --------------------')
    if (tx.value > 0) {
		console.log('3 --------------------')
      transfers.push({
        type: 'ETH',
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
		token: '',
        timestamp: block.timestamp
      });
    } else if (ethers.isAddress(tx.to)) { // Check if to field is a valid Ethereum address
		console.log('4 --------------------')
      const contract = new ethers.Contract(tx.to, abi, provider);
	  console.log('5 --------------------')
      const transferEvents = await contract.queryFilter(contract.filters.Transfer(), receipt.blockNumber, receipt.blockNumber);
	  console.log(transferEvents)
	  console.log('6 --------------------')
      if (transferEvents.length > 0) { // Check if transferEvents array is not empty
		console.log('7 --------------------')
        for (const event of transferEvents) {
			console.log('8 --------------------')
          transfers.push({
            type: 'ERC20',
            from: event.args.from,
            to: event.args.to,
            value: event.args.value.toString(),
            token: contract.target,
            timestamp: block.timestamp
          });
        }
		console.log('finished --------------------')
	  }
    }
  }
}

console.log(transfers);