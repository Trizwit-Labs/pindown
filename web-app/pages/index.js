import Head from "next/head";
import Image from "next/image";

// import styles from "../styles/Home.module.css";
const axios = require("axios");
import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { PINDOWN_CONTRACT_ADDRESS, abi } from "../constants";
import pindownImg from "../img/pin_doc.png";

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
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

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

  const addDoc = async () => {
    try {
      const rec_adr = utils.getAddress(recAddress);

      const signer = await getProviderOrSigner(true);

      const pindownContract = new Contract(
        PINDOWN_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await pindownContract.addCert(cidValue, inputValue, rec_adr);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Certificate added successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const uploadDoc = async () => {
    try {
      // window.alert("Certificate added successfully");
      axios.post(url, data, {
        headers: {
          "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const verifyDoc = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const pindownContract = new Contract(
        PINDOWN_CONTRACT_ADDRESS,
        abi,
        signer
      );
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
          <span className="bg-slate-900">
            <div className=" text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-400 drop-shadow-lg mb-4 text-center ">
              Choose any Mode: Either issue a certificate or verify one.
            </div>
            <div className="flex justify-center py-4 border-b border-slate-500">
              <a
                href="#_"
                class="relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-blue-500 border-4 border-blue-400 rounded-full hover:text-white group hover:bg-gray-50"
              >
                <span class="absolute left-0 block w-full h-0 transition-all bg-gradient-to-r from-green-300 via-blue-500 to-purple-600  opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </span>
                <button type="submit" onClick={issueMode} class="relative">
                  Issue
                </button>
              </a>
              {/* <button
                type="submit"
                onClick={issueMode}
                className="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
              >
                <a>Issue</a>
              </button> */}
              <a>
                <a
                  href="#_"
                  class="ml-4  relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-blue-500 border-4 border-blue-400 rounded-full hover:text-white group hover:bg-gray-50"
                >
                  <span class="absolute left-0 block w-full h-0 transition-all bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                  <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      class="bi bi-patch-check w-5 h-5"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"
                      />
                      <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z" />
                    </svg>
                  </span>
                  <button type="submit" onClick={verifyMode} class="relative">
                    Verify
                  </button>
                </a>
                {/* <button
                  type="submit"
                  onClick={verifyMode}
                  className="ml-4 inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600  rounded text-lg"
                >
                  Verify
                </button> */}
              </a>
            </div>
            <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 font-medium mt-6 mb-4">
              Issue Mode
            </div>
            {/* <form
              className="flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                uploadDoc();
              }}
            >
              <input type="file" id="file" className="bg-slate-400">
                Upload File
              </input>
              <button
                type="submit"
                className="mt-2 text-white bg-blue-400 border-0 py-2 px-6 focus:outline-none hover:bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 rounded text-lg"
              >
                Upload to IPFS
              </button>
            </form> */}
            <form
              className="flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                uploadDoc();
              }}
            >
              <input
                type="file"
                id="file"
                className="bg-slate-400"
                placeholder="upload cert"
              />

              <input
                className="bg-slate-800 appearance-none border-2 border-slate-500 rounded-full py-2 px-4 text-green-200 leading-tight focus:outline-none  focus:border-blue-400 my-2"
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />
              <input
                className="bg-slate-800 appearance-none border-2 border-slate-500 rounded-full py-2 px-4 text-green-200 leading-tight focus:outline-none  focus:border-blue-400 my-2"
                type="text"
                placeholder="Enter doc link!"
                value={inputValue}
                onChange={onInputChange}
              />
              <input
                className="bg-slate-800 appearance-none border-2 border-slate-500 rounded-full py-2 px-4 text-green-200 leading-tight focus:outline-none  focus:border-blue-400 my-2"
                type="text"
                placeholder="Enter receiver address!"
                value={recAddress}
                onChange={onRecAddressChange}
              />
              <button
                type="submit"
                className="mt-2 text-white bg-blue-400 border-0 py-2 px-6 focus:outline-none hover:bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 rounded text-lg"
              >
                Issue Certificate
              </button>
            </form>
          </span>
        );
      } else if (!inputMode) {
        return (
          <div>
            <div className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-400 drop-shadow-lg  text-center">
              Choose any Mode: Either issue a certificate or verify one.
            </div>

            <div className="flex justify-center my-4 py-4 border-b border-slate-500 ">
              <a
                href="#_"
                class="relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-blue-500 border-4 border-blue-400 rounded-full hover:text-white group hover:bg-gray-50"
              >
                <span class="absolute left-0 block w-full h-0 transition-all bg-gradient-to-r from-green-300 via-blue-500 to-purple-600  opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </span>
                <button type="submit" onClick={issueMode} class="relative">
                  Issue
                </button>
              </a>

              <a
                href="#_"
                class="ml-4  relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-blue-500 border-4 border-blue-400 rounded-full hover:text-white group hover:bg-gray-50"
              >
                <span class="absolute left-0 block w-full h-0 transition-all bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="bi bi-patch-check w-5 h-5"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"
                    />
                    <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z" />
                  </svg>
                </span>
                <button type="submit" onClick={verifyMode} class="relative">
                  Verify
                </button>
              </a>
            </div>
            <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 font-medium mt-6 mb-4">
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
                className="bg-slate-800 appearance-none border-2 border-slate-500 rounded-full py-2 px-4 text-green-200 leading-tight focus:outline-none  focus:border-blue-400 my-2"
                type="text"
                placeholder="Enter CID!"
                value={cidValue}
                onChange={onCidChange}
              />

              <button
                type="submit"
                className="mt-2 mb-8 text-white bg-blue-400 border-0 py-2 px-6 focus:outline-none hover:bg-gradient-to-r from-green-300 via-blue-500 to-purple-600  rounded text-lg"
              >
                Verify Certificate
              </button>
            </form>
            <div className="w-full px-4 py-6 rounded shadow-lg">
              {verifiedDoc && (
                ////////////////////////////
                ///////////////////////////

                <div className="max-w-sm rounded overflow-hidden mx-auto bg-slate-700 shadow-lg">
                  {/* <img className="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains"> */}
                  <img className="w-full mx-auto" src={verifiedDoc[1]} />
                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">
                      The Coldest Sunset
                    </div>
                    <p className="text-gray-700 text-base">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Voluptatibus quia, nulla! Maiores et perferendis eaque,
                      exercitationem praesentium nihil.
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-2">
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      #photography
                    </span>
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      #travel
                    </span>
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      #winter
                    </span>
                  </div>
                </div>

                //////////////////////////////
                /////////////////////////////
                // <div className="">
                //   <img className="max-h[300px]" src={verifiedDoc[1]} />
                //   <div className="mt-4 ">
                //     <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 ">
                //       CID:
                //     </p>
                //     <span>
                //       <p className="text-lg mb-2 text-white bg-clip">
                //         {verifiedDoc[0]}
                //       </p>
                //     </span>
                //     <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                //       Doclink:
                //     </p>
                //     <span>
                //       <p className="text-lg mb-2 text-white">
                //         {verifiedDoc[1]}
                //       </p>
                //     </span>
                //     <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                //       Issuer:
                //     </p>
                //     <span>
                //       <p className="text-lg mb-2 text-white">
                //         {verifiedDoc[2]}
                //       </p>
                //     </span>
                //     <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                //       Receiver:
                //     </p>
                //     <span>
                //       <p className="text-lg mb-2 text-white">
                //         {verifiedDoc[3]}
                //       </p>
                //     </span>
                //   </div>
                // </div>
              )}
            </div>
          </div>
        );
      } else if (loading) {
        return;
        <button className="text-2xl text-slate-500 drop-shadow-lg border border-slate-800 text-center">
          Loading...
        </button>;
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
        <a
          href="#_"
          class="relative inline-flex items-center px-12 py-3 overflow-hidden text-lg font-medium text-blue-500 border-4 border-blue-400 rounded-full hover:text-white group hover:bg-gray-50"
        >
          <span class="absolute left-0 block w-full h-0 transition-all bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
          <span class="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
            <svg
              class=" fontawesomesvg motion-safe:animate-bounce  w-5 h-5"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="white"
                d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H448c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zM416 336c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"
              />
            </svg>
          </span>
          <button onClick={connectWallet} class="relative">
            Connect your wallet
          </button>
        </a>
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
      <div className=" bg-slate-900 w-full">
        <header className="text-gray-800 font-semibold md:sticky top-0 z-10 body-font backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200 shadow-lg">
          <div className="container mx-auto flex px-5 py-4 flex-row items-center justify-between">
            <a className="flex title-font font-medium items-center text-gray-700  md:mb-0">
              {/* <img src="img/pinhead.png" alt="Pindown" width="60" /> */}
              <span className="ml-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                <h2>PinDown.</h2>
              </span>
            </a>
          </div>
        </header>
        <section className=" body-font  ">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center md:max-w-[1240px]">
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
              <h1 className="title-font sm:text-5xl text-4xl mb-4 font-medium text-transparent bg-clip-text  bg-gradient-to-r from-slate-500 to-yellow-100">
                <a className="  font-semibold">PinDown.</a>
                <br className=" hidden lg:inline-block  " />
                Blockchain-based document verifier
              </h1>
              <p className="mb-8 leading-relaxed text-lg md:text-xl text-white ">
                {walletConnected
                  ? ""
                  : "Issue and verify authentic certificates!"}
              </p>

              <p className="mb-8 leading-relaxed text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-400 ">
                {walletConnected
                  ? ""
                  : "To start off connect with your crypto wallet!"}
              </p>
            </div>
            <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
              {/* <img
                className="object-cover object-center rounded max-h-64 "
                alt="hero"
                // src={require('/img/pin_doc.png').default}
                src="https://cdn.pixabay.com/photo/2013/07/12/17/00/drawing-pin-151658__340.png"
              /> */}
              <Image src={pindownImg} className="w-full" />
            </div>
          </div>
        </section>
        <div className="flex items-center w-full mb-16 bg-slate-900">
          <div className="max-w-[1200px] mx-auto bg-slate-900">
            {renderButton()}
          </div>
        </div>

        <footer className="text-gray-500   w-full f border-t-2 border-gray-300 shadow-xl body-font ">
          <div className="container px-5 py-4 mx-auto flex items-center sm:flex-row flex-col bg-slate-900">
            <a className="flex title-font font-medium items-center md:justify-start justify-center text-violet-500">
              <span className="ml-3 text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                PinDown.
              </span>
            </a>
            <p className="text-sm text-white sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-300 sm:py-2 sm:mt-0 mt-4">
              Made with &#10084; by Trizwit
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
