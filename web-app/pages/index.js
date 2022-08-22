import Head from "next/head";
// import styles from "../styles/Home.module.css";
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
            <div className="text-2xl text-slate-500 drop-shadow-lg mb-4 text-center">
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <div className="flex justify-center py-4 border-b border-slate-500">
              <button
                type="submit"
                onClick={issueMode}
                className="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
              >
                <a>Issue</a>
              </button>
              <a>
                <button
                  type="submit"
                  onClick={verifyMode}
                  className="ml-4 inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
                >
                  Verify
                </button>
              </a>
            </div>
            <div className="text-3xl text-slate-800 font-medium mt-6 mb-4">
              Issue Mode
            </div>
            <form
              className="flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                addDoc();
              }}
            >
              <input
                className="border-2 hover:border-blue-600 my-2 "
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />
              <input
                className="border-2 hover:border-blue-600 my-2 "
                type="text"
                placeholder="Enter doc link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <input
                className="border-2 hover:border-blue-600 my-2 "
                type="text"
                placeholder="Enter receiver address!"
                value={recAddress}
                onChange={onRecAddressChange}
              />
              <button
                type="submit"
                className="mt-2 text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
              >
                Issue Certificate
              </button>
            </form>
          </>
        );
      } else if (!inputMode) {
        return (
          <div>
            <div className="text-2xl text-slate-500 drop-shadow-lg  text-center">
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            {/* <button type="submit" onClick={issueMode} className="test-2xl">
              Issue
            </button>
            <button type="submit" onClick={verifyMode}>
              Verify
            </button> */}
            <div className="flex justify-center my-4 py-4 border-b border-slate-500">
              <button
                type="submit"
                onClick={issueMode}
                className="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
              >
                <a>Issue</a>
              </button>
              <a>
                <button
                  type="submit"
                  onClick={verifyMode}
                  className="ml-4 inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
                >
                  Verify
                </button>
              </a>
            </div>
            <div className="text-3xl text-slate-800 font-medium mt-6 mb-4">
              {" "}
              Verification Mode
            </div>
            <form
              className="flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                verifyDoc();
              }}
            >
              <input
                className="border-2 hover:border-blue-600 my-2 "
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />

              <button
                type="submit"
                className="mt-2 mb-8 text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
              >
                Verify Certificate
              </button>
            </form>
            <div className="w-full px-4 py-6 rounded shadow-lg">
              {verifiedDoc && (
                <div className="">
                  <img className="max-h[300px]" src={verifiedDoc[1]} />
                  <div className="mt-4 ">
                    <p className="text-xl font-semibold text-purple-800 ">
                      CID:
                    </p>
                    <span>
                      <p className="text-lg mb-2 text-slate-800">
                        {verifiedDoc[0]}
                      </p>
                    </span>
                    <p className="text-xl font-semibold text-purple-800">
                      Doclink:
                    </p>
                    <span>
                      <p className="text-lg mb-2 text-slate-800">
                        {verifiedDoc[1]}
                      </p>
                    </span>
                    <p className="text-xl font-semibold text-purple-800">
                      Issuer:
                    </p>
                    <span>
                      <p className="text-lg mb-2 text-slate-800">
                        {verifiedDoc[2]}
                      </p>
                    </span>
                    <p className="text-xl font-semibold text-purple-800">
                      Receiver:
                    </p>
                    <span>
                      <p className="text-lg mb-2 text-slate-800">
                        {verifiedDoc[3]}
                      </p>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      } else if (loading) {
        return <button className="">Loading...</button>;
      } else {
        return (
          <>
            <div className="text-2xl text-slate-500 drop-shadow-lg border border-slate-800 text-center">
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                onClick={issueMode}
                className="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
              >
                <a>Issue</a>
              </button>
              <a>
                <button
                  type="submit"
                  onClick={verifyMode}
                  className="ml-4 inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
                >
                  Verify
                </button>
              </a>
            </div>
          </>
        );
      }
    } else {
      return (
        <button
          onClick={connectWallet}
          className="mt-2 mb-8 text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
        >
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
      <div className=" bg-gradient-to-r  w-full from-rose-50 to-teal-50">
        <header className="text-gray-800 font-semibold md:sticky top-0 z-10 body-font backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200 shadow-lg">
          <div className="container mx-auto flex px-5 py-4 flex-row items-center justify-between">
            <a className="flex title-font font-medium items-center text-gray-700  md:mb-0">
              {/* <img src="img/pinhead.png" alt="Pindown" width="60" /> */}
              <span className="ml-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-700 via-purple-800 to-violet-600">
                <h2>PinDown.</h2>
              </span>
            </a>
          </div>
        </header>
        <section className="text-gray-700 body-font ">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center md:max-w-[1240px]">
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
              <h1 className="title-font sm:text-5xl text-4xl mb-4 font-medium text-gray-500">
                <a className="text-gray-800 font-semibold">PinDown </a>
                <br className="hidden lg:inline-block" />
                Certificate Issuer and verifier
              </h1>
              <p className="mb-8 leading-relaxed text-lg md:text-xl">
                Pindown is a blockchain-based document verifier. Verify the
                authenticity of any certificate.
              </p>
            </div>
            <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
              <img
                className="object-cover object-center rounded max-h-64"
                alt="hero"
                src="https://cdn.pixabay.com/photo/2013/07/12/17/00/drawing-pin-151658__340.png"
              />
            </div>
          </div>
        </section>
        <div className="flex items-center w-full mb-16">
          <div className="max-w-[1200px] mx-auto">{renderButton()}</div>
        </div>

        <footer className="text-gray-500 bg-gradient-to-r  w-full from-rose-50 to-teal-50 border-t-2 border-gray-300 shadow-xl body-font">
          <div className="container px-5 py-4 mx-auto flex items-center sm:flex-row flex-col">
            <a className="flex title-font font-medium items-center md:justify-start justify-center text-violet-500">
              {/* <img src="img/zindothead.png" alt="Zindot" width="50" height="50" /> */}
              <span className="ml-3 text-2xl">PinDown.</span>
            </a>
            <p className="text-sm text-gray-600 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-300 sm:py-2 sm:mt-0 mt-4">
              Made with &#10084; by Trizwit
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
