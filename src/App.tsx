import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import contract from "../artifacts/contracts/Buycar.sol/Buycar.json";
import contractInfo from "../contractInfo/Buycar.json";
import styles from './Home.module.css'
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: {
      request: any
    }
  }
}

function App() {
  const contractABI = contract.abi;
  const contractAddress = contractInfo.contractAddress;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event: any) => {
    setName(event.target.name);
  }

  const onMessageChange = (event: any) => {
    setMessage(event.target.name);
  }

  const isWalletConnected = async () => {
    try {
      if (window.ethereum) {
        const {ethereum} = window;
        const accounts = await ethereum.request({method: 'eth_accounts'});
        console.log("accounts:", accounts);

        if (accounts.length > 0) {
          const account = accounts[0];
        } else {
          console.log("make sure MetaMask is connected");
        }
      } else {
        console.log("please install MetaMask");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCar = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum, "any");
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        console.log("buying car..")
        const tx = await contract.byCar(
          name ? name : "anon",
          message ? message : "Enjoy your car!",
          {value: ethers.parseEther("0.001")}
        );

        await tx.wait();
        console.log("mined ", tx.hash);
        console.log("car purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await contract.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(async () => {
    let buyCar: { off: (arg0: string, arg1: (from: any, timestamp: number, name: any, message: any) => void) => void; };
    isWalletConnected();
    getMemos();

    const onNewMemo = (from: any, timestamp: number, name: any, message: any) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum, "any");
      const signer = await provider.getSigner();
      const buyCar = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyCar.on("NewMemo", onNewMemo);
    }

    return () => {
      if (contract) {
        buyCar.off("NewMemo", onNewMemo);
      }
    }
  }, [])

  return (
    <div className={styles.container}>

    <main className={styles.main}>
      <h1 className={styles.title}>
        Buy Albert a Coffee!
      </h1>
      
      {currentAccount ? (
        <div>
          <form>
            <div className="formgroup">
              <label>
                Name
              </label>
              <br/>
              
              <input
                id="name"
                type="text"
                placeholder="anon"
                onChange={onNameChange}
                />
            </div>
            <br/>
            <div className="formgroup">
              <label>
                Send Albert a message
              </label>
              <br/>

              <textarea
                rows={3}
                placeholder="Enjoy your coffee!"
                id="message"
                onChange={onMessageChange}
                required
              >
              </textarea>
            </div>
            <div>
              <button
                type="button"
                onClick={buyCar}
              >
                Send 1 Coffee for 0.001ETH
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={connectWallet}> Connect your wallet </button>
      )}
    </main>

    {currentAccount && (<h1>Memos received</h1>)}

    {currentAccount && (memos.map((memo, idx) => {
      return (
        <div key={idx}>
          <p>"{memo.message}"</p>
          <p>From: {memo.name} at {memo.timestamp.toString()}</p>
        </div>
      )
    }))}

    <footer className={styles.footer}>
      <a
        href="https://alchemy.com/?a=roadtoweb3weektwo"
        target="_blank"
        rel="noopener noreferrer"
      >
        Created by @thatguyintech for Alchemy's Road to Web3 lesson two!
      </a>
    </footer>
  </div>
  );
}

export default App;
