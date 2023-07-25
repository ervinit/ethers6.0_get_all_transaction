import { ethers } from 'ethers';

const abi = [
	'function balanceOf(address) view returns (uint)',
	'function transfer(address to, uint256 amount)',
	'event Transfer(address indexed from, address indexed to, uint value)',
];


const iface = new ethers.Interface(abi);

const blockNumber = 3580732;
const rpcUrl = 'https://rpc.sepolia.org/';
const provider = new ethers.JsonRpcProvider(rpcUrl);

async function getTransactionDetails(blockNumber) {
	const block = await provider.getBlock(blockNumber);
	const transactionHashes = block.transactions;
	const transactionPromises = transactionHashes.map((hash) =>
		provider.getTransaction(hash),
	);
	const transactions = await Promise.all(transactionPromises);
	const ethTransfers = transactions.filter((tx) => {
		if (tx.value > 0) {
			return true;
		}
	});
	const erc20Transfers = transactions.filter((tx) => {
		const data = tx.data || '0x';
		const functionSignature = data.slice(0, 10);
		return functionSignature === '0xa9059cbb' || '0x095ea7b3';
	});
	return { ethTransfers, erc20Transfers };
}

const res = await getTransactionDetails(blockNumber);
for (const event of res.ethTransfers) {
	if (
		event.hash ===
		'0x3806efc221a000b9c3b403bd5064ad87485cb46cdb91544294f32b412755c715'
	) {
		console.log('>>>> ETH FOUND');
		//console.log(event);
		const bigNumber = ethers.getBigInt(event.value);
		const txReceipt = await provider.getTransactionReceipt(event.hash);
		let status = '';
		if (txReceipt.status === 1) {
			status = 'success';
		} else {
			status = 'fail';
		}

		let type = '';
		if (event.data === "0x") {
			console.log("This is Value Transfer Transaction.");
			type = 'transfer';
		} else {
			console.log("This is Smart Contract Transaction.");
			type = iface.parseTransaction({data: event.data});
		}

		const blockTxnData = {
			from: event.from,
			to: event.to,
			transactionHash: event.hash,
			chain: 'sepolia',
			blockNumber: event.blockNumber,
			value: event.value.toString(),
			readableValue: ethers.formatEther(bigNumber),
			token: 'doge',
			type: type,
			status: status,
		};
		console.log(
			'LS -> test/eth-block-1.mjs:55 -> blockTxnData: ',
			blockTxnData,
		);
	}
}

for (const event of res.erc20Transfers) {
	if (
		event.hash ===
		'0xb286b68e910d1c22c8b1a2e31dc331f2ba771021ea752d58d51bceac11860086'
	) {
		console.log('>>>> DOGE FOUND');
		console.log(event);

		const txReceipt = await provider.getTransactionReceipt(event.hash);	
		
		let status = '';
		if (txReceipt.status === 1) {
			status = 'success';
		} else {
			status = 'fail';
		}
		
		let amount = 0;
		let recipientAddress = '';
		let senderAddress = '';
		let type = '';
		const methodSelector = event.data.substring(0, 10);
		
		if(methodSelector=='0xa9059cbb'){ // Transfer Method
			recipientAddress = `0x${txReceipt.logs[0].topics[1].substring(26)}`;
			amount = ethers.formatUnits(txReceipt.logs[0].data,18);
			type = 'transfer';
		}else if(methodSelector=='0x095ea7b3'){ //Approval Method
			senderAddress = `0x${txReceipt.logs[0].topics[1].substring(26)}`;
			amount = ethers.formatUnits(txReceipt.logs.data,18);
			type = 'approval';
		}

		const blockTxnData = {
			from: type == 'transfer'? event.from: senderAddress,
			to: type == 'transfer'? recipientAddress: event.from,
			transactionHash: event.hash,
			chain: 'sepolia',
			blockNumber: event.blockNumber,
			value: txReceipt.logs[0].data.toString(),
			readableValue: amount,
			token: 'doge',
			type: type,
			status: status,
		};
		console.log(
			'LS -> test/eth-block-1.mjs:67 -> blockTxnData: ',
			blockTxnData,
		);
	}
}
