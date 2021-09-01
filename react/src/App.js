import React, { useState } from "react";
import { site } from "./abi/abi";
import Web3 from "web3";
import logo from './logo.svg';
import './App.css';

const web3 = new Web3(Web3.givenProvider);

const contractAddress = "0xd452Beeb06f70F6112Bd75f3D15f96c7104e3A55";
const siteContract = new web3.eth.Contract(site, contractAddress);

function App() {
  const [getTest, setTest] = useState("uninitialized dummy string");
  
  const messageGet = async (t) => {
	  t.preventDefault();
	  const post = await siteContract.methods.getTestMessage().call();
	  setTest(post);
  };

  return (
	  <div className="main">
	    <div className="card">
	      <button className="button" onClick={messageGet} type="button">
	        Get message from Rinkeby contract
	      </button>
	      {getTest}
	    </div>
	  </div>
  );
}

export default App;
