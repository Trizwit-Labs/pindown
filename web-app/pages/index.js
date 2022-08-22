import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { PINDOWN_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  // const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  const [inputMode, setinputMode] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [cidValue, setCidValue] = useState("");
  const [recAddress, setRecAddress] = useState("");
  const [verifiedDoc, setVerifiedDoc] = useState("");

  // const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addDoc = async () => {
    try {
      const rec_adr = utils.getAddress(recAddress);
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const pindownContract = new Contract(
        PINDOWN_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await pindownContract.addCert(cidValue, inputValue, rec_adr);
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("Certificate added successfully");
    } catch (err) {
      console.error(err);
    }
  };

  // const getNumberOfWhitelisted = async () => {
  //   try {
  //     // Get the provider from web3Modal, which in our case is MetaMask
  //     // No need for the Signer here, as we are only reading state from the blockchain
  //     const provider = await getProviderOrSigner();
  //     // We connect to the Contract using a Provider, so we will only
  //     // have read-only access to the Contract
  //     const pindownContract = new Contract(
  //       PINDOWN_CONTRACT_ADDRESS,
  //       abi,
  //       provider
  //     );
  //     // call the numAddressesWhitelisted from the contract
  //     const _numberOfWhitelisted =
  //       await pindownContract.numAddressesWhitelisted();
  //     setNumberOfWhitelisted(_numberOfWhitelisted);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const verifyDoc = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const pindownContract = new Contract(
        PINDOWN_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();

      const _verifiedcertificate = await pindownContract.getCert(cidValue);
      console.log(_verifiedcertificate);
      setVerifiedDoc(_verifiedcertificate);

      setinputMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };
  const onCidChange = (event) => {
    const { value } = event.target;
    setCidValue(value);
  };
  const onRecAddressChange = (event) => {
    const { value } = event.target;
    setRecAddress(value);
  };

  const issueMode = async () => {
    setinputMode(true);
  };
  const verifyMode = async () => {
    setinputMode(false);
  };

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    if (walletConnected) {
      if (inputMode) {
        return (
          <>
            <div className={styles.description}>
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <button type="submit" onClick={issueMode}>
              Issue
            </button>
            <button type="submit" onClick={verifyMode}>
              Verify
            </button>
            <div>Issue Mode</div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addDoc();
              }}
            >
              <input
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />
              <input
                type="text"
                placeholder="Enter doc link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <input
                type="text"
                placeholder="Enter receiver address!"
                value={recAddress}
                onChange={onRecAddressChange}
              />
              <button type="submit" className={styles.button}>
                Issue Certificate
              </button>
            </form>
          </>
        );
      } else if (!inputMode) {
        return (
          <>
            <div className={styles.description}>
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <button type="submit" onClick={issueMode}>
              Issue
            </button>
            <button type="submit" onClick={verifyMode}>
              Verify
            </button>
            <div> verification Mode</div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                verifyDoc();
              }}
            >
              <input
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />

              <button type="submit" className={styles.button}>
                Verify Certificate
              </button>
            </form>
            <div>
              {verifiedDoc && (
                <div>
                  <img src={verifiedDoc[1]} />
                  <p>CID:</p>
                  <span>{verifiedDoc[0]}</span>
                  <p>Doclink:</p>
                  <span>{verifiedDoc[1]}</span>
                  <p>Issuer:</p>
                  <span>{verifiedDoc[2]}</span>
                  <p>Receiver:</p>
                  <span>{verifiedDoc[3]}</span>
                </div>
              )}
            </div>
          </>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <>
            <div className={styles.description}>
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <button type="submit" onClick={issueMode}>
              Issue
            </button>
            <button
              type="submit"
              className="cta-button cta-position submit-gif-button"
              onClick={verifyMode}
            >
              Verify
            </button>
          </>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>PinDown</title>
        <meta
          name="description"
          content="Pindown: Blockchain based Certificate Issuer Verifier"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>PinDown</h1>
          <div className={styles.description}>Easy Certificate Verifier</div>
          {/* <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div> */}
          {renderButton()}
        </div>
        <div>
          {/* <img className={styles.image} src="./crypto-devs.svg" /> */}
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Trizwit</footer>
    </div>
  );
}
