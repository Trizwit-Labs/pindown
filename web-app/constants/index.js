export const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_certificateid",
        type: "string",
      },
      {
        internalType: "string",
        name: "_doclink",
        type: "string",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "addCert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "certificates",
    outputs: [
      {
        internalType: "bool",
        name: "valid",
        type: "bool",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "string",
        name: "doclink",
        type: "string",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_certificateid",
        type: "string",
      },
    ],
    name: "getCert",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export const PINDOWN_CONTRACT_ADDRESS =
  "0x7B5EF29E5808a9ccF8d4b0f1c32AF9Ea46184551";
