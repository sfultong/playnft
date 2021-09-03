import React, { useState } from "react";
import { site } from "./abi/abi";
import Web3 from "web3";
import logo from './logo.svg';
import './App.css';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';

const web3 = new Web3(Web3.givenProvider);

const contractAddress = "0xd452Beeb06f70F6112Bd75f3D15f96c7104e3A55";
const siteContract = new web3.eth.Contract(site, contractAddress);

const installMetamask = 0;
const loginMetamask = 1;
const activeMetamask = 2;

var provider;

class MetaMaskButton extends React.Component {


    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.getDisplay = this.getDisplay.bind(this);
        this.login = this.login.bind(this);
        this.init = this.init.bind(this);

        this.state = {
            value: installMetamask,
        };

        this.init();
    }

    handleClick () {
        if (this.state.value === installMetamask) {
            window.open(
              "https://metamask.io/",
              "_blank"
            );
        } else if (this.state.value === loginMetamask) {
            this.login();
        } else {
            // shouldn't be possible
            alert("handleClick: shouldn't be here");
        }
    }

    async init () {
        const _provider = await detectEthereumProvider();

        if (_provider) {
            // From now on, this should always be true:
            // provider === window.ethereum
            provider = _provider;
            this.setState({value: loginMetamask});
        } else {
        }
    }

    async login () {
        const t = this;
        try {
            provider.request({ method: 'eth_requestAccounts' })
                .then((result) => {
                    t.setState({value: activeMetamask});
                })
                .catch((error) => {
                });
        } catch (error) {
        }
    }

    getDisplay () {
        return this.state.value === installMetamask ? "Install Metamask"
            : this.state.value === loginMetamask ? "Login to Metamask"
            : "This message should be hidden";
    }


    render () {
        if (this.state.value === activeMetamask) {
            return (<div></div>);
        } else
        return (
                <button className="button" onClick={this.handleClick}>
                {this.getDisplay()}
                </button>
        );
    }
}

function App() {
    const [getTest, setTest] = useState("uninitialized dummy string");
    const [getAddr, setAddr] = useState("no address loaded");

    const messageGet = async (t) => {
	      t.preventDefault();
	      const post = await siteContract.methods.getTestMessage().call();
	      setTest(post);
    };

    (async () => {
        const accounts = await web3.eth.getAccounts();
        setAddr(accounts[0]);
    })();

    return (
        <div className="main">
            <div className="card">
                <MetaMaskButton />
                <div>{getAddr}</div>
                <button className="button" onClick={messageGet} type="button">
                Get message from Rinkeby contract
                </button>
                {getTest}
            </div>
       </div>
    );
}

export default App;
