// import Web3 from "./web3";
// import detectEthereumProvider from "./detect-provider";


const provider = await detectEthereumProvider()

if (provider) {

  console.log('Ethereum successfully detected!')

  // From now on, this should always be true:
  // provider === window.ethereum

  // Access the decentralized web!

  // Legacy providers may only have ethereum.sendAsync
  const chainId = await provider.request({
    method: 'eth_chainId'
  })
} else {

  // if the provider is not detected, detectEthereumProvider resolves to null
  console.error('Please install MetaMask!', error)
}

// const web3 = new Web3(Web3.givenProvider);
const web3 = new Web3(Web3.givenProvider);


// const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
// const siteContract = new web3.eth.Contract(site, contractAddress);


// const messageGet = async (t) => {
// 	      // t.preventDefault();
// 	      const post = await siteContract.methods.getTestMessage().call();
// 	      // setTest(post);
// 	      return post;
//     };
