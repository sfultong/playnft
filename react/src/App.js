import React, { useState } from "react";
import axios from 'axios';
import { site } from "./abi/abi";
import Web3 from "web3";
import logo from './logo.svg';
import './App.css';
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const apiHost = process.env.REACT_APP_API_HOST;

const installMetamask = 0;
const loginMetamask = 1;
const activeMetamask = 2;

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

const getNumArt = function () {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getNumArt().call().then((r) => resolve(r[0]));
        });
    });
};

const getNumArtists = function () {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getNumArtist().call().then((r) => resolve(r[0]));
        });
    });
};

const getArt = function (artId) {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getArt(artId).call().then(resolve);
        });
    });
};

const getArtist = function (artistAddress) {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getArtist(artistAddress).call().then(resolve);
        });
    });
};

const getFeature = function (featureId) {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getFeature(featureId).call().then(resolve);
        });
    });
};

const getDisplayFeature = function (artId) {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            sc.methods.getDisplayFeature(artId).call().then((r) => resolve(r[0]));
        });
    });
};

const startArtWithFeature = function () {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            userAccount.then ((account) => {
                sc.methods.startArtWithFeature().estimateGas().then((gas) => {
                    sc.methods.startArtWithFeature().send({
                        from: account,
                        gas,
                    }).on('error', function(error, receipt) {
                        reject(error);
                    }).on('receipt', function(receipt) {
                        resolve(receipt);
                    });
                });
            });
        });
    });
};


const startFeature = function (artId, endTime) {
    return new Promise((resolve, reject) => {
        siteContract.then((sc) => {
            userAccount.then ((account) => {
                const method = sc.methods.startFeature(artId, endTime);
                method.estimateGas().then((gas) => {
                    method.send({
                        from: account,
                        gas,
                    }).on('error', function(error, receipt) {
                        reject(error);
                    }).on('receipt', function(receipt) {
                        resolve(receipt);
                    });
                });
            });
        });
    });
};

const signFeatureImage = function (featureId, imageHash) {
    return new Promise((resolve, reject) => {
        web3.then ((w3) => {
            userAccount.then ((account) => {
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
                            {name:"featureId",type:"uint64"},
                            {name:"imageHash",type:"string"}
                        ]
                    },
                        primaryType:"Message",
                        domain:{name:"Play NFT",
                                version:process.env.REACT_APP_VERSION,
                                chainId:process.env.REACT_APP_CHAIN_ID,
                                verifyingContract:process.env.REACT_APP_CONTRACT_ADDRESS
                                },
                        message:{featureId:featureId, imageHash:imageHash}
                    });

                    w3.currentProvider.sendAsync(
                        {
                            method: "eth_signTypedData_v3",
                            params: [account, msgParams],
                            from: account
                        },
                        function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({message: msgParams, signature: result.result});
                            }
                        }
                    );
                });
            });
        });
    });
};


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

class AdminInterface extends React.Component {
    constructor(props) {
        super (props);

        this.changeHandler = this.changeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
        };
    }

    componentDidMount() {
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
                <h1>Admin Interface</h1>
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

        this.imageChangeHandler = this.imageChangeHandler.bind(this);
        this.featureEndChangeHandler = this.featureEndChangeHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
        };
    }

    imageChangeHandler (event) {
        this.setState({file: event.target.files[0]});
    }

    featureEndChangeHandler (event) {
        const localEndTime = new Date(event.target.value);
        this.setState({featureEndTime: localEndTime.getTime() / 1000});
    }

    async handleSubmit () {
        const thisFile = this.state.file;
        const featureEndTime = this.state.featureEndTime;

        if (! thisFile) {
            alert ("no file");
        } else {
            web3.then ((w3) => {
                startArtWithFeature().then((receipt) => {
                    const artId = receipt.events.ArtCreated.returnValues.artId;
                    const featureId = receipt.events.FeatureCreated.returnValues.featureId;
                    const imageHash = w3.utils.sha3(encodeURIComponent(thisFile.text()));
                    signFeatureImage(featureId, imageHash).then((signResult) => {
                        const formData = new FormData();
                        formData.append("image", thisFile);
                        formData.append("signedData", signResult.message);
                        formData.append("signature", signResult.signature);
                        formData.append("feature", featureId);

                        axios.post(apiHost + "/upload-image", formData).then ((res) => {
                            if (res.data.status) {
                                startFeature(artId, featureEndTime).then((featureReceipt) => {
                                    alert ("new art created");
                                    console.log(receipt);
                                });
                            } else {
                                alert ("error uploading image");
                                console.log (res.data);
                            }
                        }).catch ((err) => {
                            alert ("error uploading file: " + err);
                        });
                    });
                });
            });
        }
    }

    // TODO eventually display dropdown for artist with list of completed bids to use to indentify art

    render () {
        return (
        <div className="artInterface">
            <h1>Artist Interface</h1>
            <div className="uploadArt">
                <form action="" method="post" enctype="multipart/form-data">
                <label for="featureEndTime">Feature Auction Ends At:</label>
                <input type="datetime-local" name="featureEndTime" id="featureEndTime" onChange={this.featureEndChangeHandler}/>
                <label for="file">Image:</label>
                <input type="file" name="image" id="image-upload" onChange={this.imageChangeHandler} />
                <button className="button" onClick={this.handleSubmit} type="button">New Art</button>
                </form>
            </div>
        </div>
        );
    }
}

class ArtListing extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
        };
    }

    render () {
        return (
                <div className="artListing">
                <h3>{this.props.artistName}</h3>
                <img src={this.props.imgUrl}/>
                <p className="listingFeatureEnd">{this.props.endTime}</p>
                </div>
        );
    }
}

class ArtDisplay extends React.Component {
    constructor (props) {
        super (props);

        this.state = {
            artList: []
        };
    }

    componentDidMount() {
        const thisComponent = this;
        getNumArt().then((na) => {
            console.log("number of art is " + na);
            var artPromise = function (i) {
                return new Promise ((resolve, reject) => {
                    getArt(i).then((art) => {
                        const currentFeatureId = art[2];
                        getArtist(art[0]).then((artist) => {
                            getDisplayFeature(i).then((fid) => {
                                const endTimeCallback = (timeText) => {
                                    const imgUrl = apiHost + "/" + fid + ".png";
                                    resolve({artistName: artist[0], imgUrl: imgUrl, timeText: timeText });
                                };
                                if (currentFeatureId > -1) {
                                    getFeature(currentFeatureId).then((feature) => {
                                        console.log("feature");
                                        console.log(feature);
                                        const endTime = new Date(feature[1] * 1000);
                                        endTimeCallback("Bidding ending at " + endTime);
                                    });
                                } else {
                                    endTimeCallback("Not open for bidding yet");
                                }
                            });
                        });
                    });
                });
            };
            var artPromises = [];
            for (var i = 1; i <= 10 && na - i >= 0; i++) {
                var artId = na - i;
                artPromises.push(artPromise(artId));
            }
            Promise.all(artPromises).then((artList) => thisComponent.setState({artList: artList}));
        });
    }

    render () {
        const list = this.state.artList.map((artItem) => {
            return (
                    <ArtListing artistName={artItem.artistName} imgUrl={artItem.imgUrl} endTime={artItem.timeText} />
            );
        });
        return (
                <div className="artDisplay">
                <h1>Art Listings</h1>
                {list}
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
            <div className="card">
                <MetaMaskButton />
                <div>{getAddr}</div>
                <button className="button" onClick={messageGet} type="button">
                Get message from Rinkeby contract
                </button>
                {getTest}
                <AdminInterface />
                <ArtistInterface />
                <ArtDisplay />
            </div>
       </div>
    );
}

export default App;
