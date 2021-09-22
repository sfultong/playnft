import { site } from "./abi.js";
import { WebSocketServer } from 'ws';
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';
import dotenv from "dotenv";

dotenv.config();

const provider = {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
};

const web3 = new Web3(provider);

const contractAddress = process.env.CONTRACT_ADDRESS;

const siteContract = new web3.eth.Contract(site, contractAddress);

const messageGet = async (t) => {
          // t.preventDefault();
          const post = await siteContract.methods.getTestMessage().call();
          // setTest(post);
          // console.log(post);
          // myVar = post;
          // return post;
          return "hello from messageGet";
    };

const wss = new WebSocketServer({ port: 8082 });

let hello = async () => {return "Hello, Daniel.";}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // messageGet().then(console.log);
    messageGet().then((value) => {
      console.log(value)
      ws.send(value);
    });
    // hello().then(console.log);
    // messageGet().then((value) => {
    //   console.log(value);
    //   ws.send(value));
    // }
    // console.log(rv)
    // ws.send("somethingBLAAAA");
  });


});
