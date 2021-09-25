import React, { useState } from "react";
import axios from 'axios';
import { site } from "./abi/abi";
import Web3 from "web3";
import logo from './logo.svg';
import './App.css';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';

//const web3 = new Web3(Web3.givenProvider);

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const apiHost = process.env.REACT_APP_API_HOST;
//const siteContract = new web3.eth.Contract(site, contractAddress);

const installMetamask = 0;
const loginMetamask = 1;
const activeMetamask = 2;


// const web3 = (function () {
//     var provider;
//     var web3;
//     var init = false;

//     return async function () {
//         if (! init) {
//             while (! provider) {
//                 provider = await detectEthereumProvider();
//                 await new Promise(r => setTimeout(r, 2000));
//             }

//             web3 = new Web3(provider);
//         }
//         return web3;
//     };
// })();

// const siteContract = (function () {
//     var sc;

//     return async function () {
//         if (! sc) {
//             const web3_ = await web3();
//             sc = new web3_.eth.Contract(site, contractAddress);
//         }

//         return sc;
//     };
// })();

const web3 = new Promise ((resolve, reject) => {
    detectEthereumProvider().then((provider) => {
        if (provider) {
            resolve(new Web3(provider));
        } else {
            reject("No Ethereum wallet detected");
        }
    });
});

const siteContract = new Promise ((resolve, reject) => {
    web3.then((w3) => {
        resolve(new w3.eth.Contract(site, contractAddress));
    });
});

const userAccount = new Promise ((resolve, reject) => {
    detectEthereumProvider().then((ep) => {
        ep.request({ method: 'eth_requestAccounts' }).then((accounts) => {
            resolve(accounts[0]);
        });
    });
});


class MetaMaskButton extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.getDisplay = this.getDisplay.bind(this);
        this.login = this.login.bind(this);

        this.state = {
            value: installMetamask,
        };

        var t = this;
        var cb = function () {
            t.setState({value: loginMetamask});
        };
        web3.then(cb);
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

    async login () {
        const t = this;
        try {
            const provider = await detectEthereumProvider();
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

class ImageUpload extends React.Component {
    constructor(props) {
        super(props);

        this.changeHandler = this.changeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
        };

    }

    changeHandler (event) {
        this.setState({file: event.target.files[0]});
    };

    handleSubmit () {
        if (! this.state.file) {
            alert ("no file");
        } else {
            const formData = new FormData();
            formData.append("image", this.state.file);

            axios.post(apiHost + "/upload-image", formData)
                .then ((res) => {
                    if (res.data.status) {
                        alert (res.data.message);
                    } else {
                        alert (res.data);
                    }
                }).catch ((err) => {
                    alert ("error uploading file: " + err);
                });
        }
    }

    render () {
        return (
        <div className="imageUploadForm">
            <form action="" method="post" enctype="multipart/form-data">
            <label for="file">Filename:</label>
                <input type="file" name="image2" id="image-upload2" onChange={this.changeHandler} />
            <button className="button" onClick={this.handleSubmit} type="button">Submit</button>
            </form>
        </div>
        );
    }
}

class AdminInterface extends React.Component {
    constructor(props) {
        super (props);

        this.changeHandler = this.changeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
        };
        siteContract.then((sc) => {
            sc.methods.getNumArtist().call().then((na) => {
                this.setState({numArtists: na});
            });
        });
    }

    changeHandler (v) {
        this.setState({address: v.target.value});
    }

    async handleSubmit (t) {
        t.preventDefault();
        siteContract.then((sc) => {
            userAccount.then ((account) => {
                const address = this.state.address;
                sc.methods.addArtist(address).estimateGas().then((gas) => {
                    // TODO show a spinner here
                    try {
                        const method = sc.methods.addArtist(address);
                        console.log(method);
                        const post = method.send({
                            from: account,
                            gas,
                        });
                        post.on('transactionHash', function(hash){
                            console.log("add artist transaction hash: " + hash);
                        }).on('receipt', function(receipt){
                            // TODO hide spinner here
                            console.log(receipt);
                            if (receipt.status) {
                                alert("Added artist");
                            } else {
                                alert("something went wrong on receipt of transaction");
                                console.log("add artist receipt");
                                console.log(receipt);
                            }
                        }).on('error', function(error, receipt) {
                            // TODO hide spinner here
                            alert("transaction failed");
                            console.log(error);
                            console.log(receipt);
                        });
                    } catch (error) {
                        console.log(error);
                        alert(error);
                    }
                });
            });
        });
    }

    render () {
        return (
                <div className="adminInterface">
                <div>
                    <label for="artist_address">Artist address</label>
                    <input type="text" id="artist_address" name="artist_address" onChange={this.changeHandler}/>
                    <button className="button" onClick={this.handleSubmit} type="button">
                    Submit
                    </button>
                </div>
                <div>
                Number of artists is currently: {this.state.numArtists}
                </div>
                </div>
        );
    }
}

class ArtistInterface extends React.Component {
    constructor (props) {
        super (props);

        this.changeHandler = this.changeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleArtStart = this.handleArtStart.bind(this);

        this.state = {
        };
    }

    constructMessage (imageHash, callback) {
        web3.then ((w3) => {
            w3.currentProvider.sendAsync({
                method: 'net_version',
                params: [],
                jsonrpc: "2.0"
            }, function (err, result) {
                const netId = result.result;
                const msgParams = JSON.stringify({types:{
                    EIP712Domain:[
                        {name:"name",type:"string"},
                        {name:"version",type:"string"},
                        {name:"chainId",type:"uint256"},
                        {name:"verifyingContract",type:"address"}
                    ],
                    Message:[
                        {name:"imageHash",type:"string"}
                    ]
                },
                    primaryType:"Message",
                    domain:{name:"Play NFT",
                            version:process.env.REACT_APP_VERSION,
                            chainId:process.env.REACT_APP_CHAIN_ID,
                            verifyingContract:process.env.REACT_APP_CONTRACT_ADDRESS
                            },
                    message:{imageHash:imageHash}
                });

                callback(msgParams);
            });
        });
    }

    changeHandler (event) {
        console.log("image change handler");
        console.log(event.target);
        this.setState({file: event.target.files[0]});
    }

    async handleArtStart (t) {
        t.preventDefault();
        siteContract.then((sc) => {
            userAccount.then ((account) => {
                sc.methods.startArt().estimateGas().then((gas) => {
                    const address = this.state.address;
                    try {
                        // TODO show a spinner here
                        const post = sc.methods.startArt().send({
                            from: account,
                            gas,
                        });
                        post.on('transactionHash', function(hash){
                            console.log("start art transaction hash: " + hash);
                        }).on('receipt', function(receipt){
                            // TODO hide spinner here
                            alert(receipt);
                            console.log(receipt);
                        }).on('error', function(error, receipt) {
                            // TODO hide spinner here
                            alert(error);
                            alert(receipt);
                            console.log(error);
                        });

                    } catch (error) {
                        alert(error);
                    }
                });
            });
        });
    }

    async handleSubmit () {
        var thisFile = this.state.file;
        if (! thisFile) {
            alert ("no file");
        } else {
            web3.then ((w3) => {
                userAccount.then ((account) => {
                    var imageHash = w3.utils.sha3(encodeURIComponent(thisFile.text()));
                    console.log("imageHash");
                    console.log(imageHash);
                    this.constructMessage (w3.utils.sha3(imageHash), function (message) {
                        console.log(message);
                        w3.currentProvider.sendAsync(
                            {
                                method: "eth_signTypedData_v3",
                                params: [account, message],
                                from: account
                            },
                            function(err, result) {
                                if (err) {
                                    alert("signing error");
                                    console.error(err);
                                }

                                const formData = new FormData();
                                formData.append("image", thisFile);
                                formData.append("signedData", message);
                                formData.append("signature", result.result);

                                axios.post(apiHost + "/upload-image", formData)
                                    .then ((res) => {
                                        if (res.data.status) {
                                            alert (res.data.message);
                                        } else {
                                            alert (res.data);
                                        }
                                    }).catch ((err) => {
                                        alert ("error uploading file: " + err);
                                    });
                            }
                        );
                    });
                });
            });
        }
    }

    // TODO eventually display dropdown for artist with list of completed bids to use to indentify art

    render () {
        return (
        <div className="artInterface">
            <div className="startArtButton">
                <button className="button" onClick={this.handleArtStart} type="button">New Art</button>
            </div>
            <div className="uploadArt">
                <form action="" method="post" enctype="multipart/form-data">
                <label for="file">Filename:</label>
                <input type="file" name="image" id="image-upload" onChange={this.changeHandler} />
                <button className="button" onClick={this.handleSubmit} type="button">Submit</button>
                </form>
            </div>
        </div>
        );
    }
}

function App() {
    const [getTest, setTest] = useState("uninitialized dummy string");
    const [getAddr, setAddr] = useState("no address loaded");

    const messageGet = async (t) => {
	      t.preventDefault();
        siteContract.then((sc) => {
            sc.methods.getTestMessage().call().then((tm) => {
                setTest(tm);
            });
        });
    };

    userAccount.then ((ua) => {
        setAddr(ua);
    });

    return (
        <div className="main">
            <div>
            <img src="http://localhost:8081/caring_sam.jpg"/>
            </div>
            <ImageUpload />
            <div className="card">
                <MetaMaskButton />
                <div>{getAddr}</div>
                <button className="button" onClick={messageGet} type="button">
                Get message from Rinkeby contract
                </button>
                {getTest}
                <AdminInterface />
                <ArtistInterface />
            </div>
       </div>
    );
}

export default App;
