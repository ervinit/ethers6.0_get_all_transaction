# eth_erc20_ethers
get all ETH and ERC20 Transaction details from special block number.

### Details
This project is using ethers 6.4.0.
There are some differences between ethers5 and ethers6.

1. Get all transactions from special block number.
if value field of transaction detail is not 0, it is ETH transactions. and if data field of transaction detail has hex string, it is smart contract history.
The first 10 charactors is equal with '0xa9059cbb', then the contract is Transfer method, and is equal with '0x095ea7b3', then it is Approval method.

2. Get Transaction detail.
const txReceipt = await provider.getTransactionReceipt(event.hash);


