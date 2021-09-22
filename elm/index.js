import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';

const web3 = new Web3(Web3.givenProvider);

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const siteContract = new web3.eth.Contract(site, contractAddress);


const messageGet = async (t) => {
	      t.preventDefault();
	      const post = await siteContract.methods.getTestMessage().call();
	      // setTest(post);
	      return post;
    };
