// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

export default function handler(req, res) {
  if (req.method === "POST") {
    const pinata_api_key = "f2c375a1ea40d7719ea3";
    const pinata_secret_api_key =
      "98d76f167b22a0144b85deb4bbe7338d4df1b05ab8b4495062e892e1ad379602";
  } else {
    res.status(200).json({ name: "hey" });
  }
}

const testAuthentication = () => {
  const url = `https://api.pinata.cloud/data/testAuthentication`;
  return axios
    .get(url, {
      headers: {
        pinata_api_key: "f2c375a1ea40d7719ea3",
        pinata_secret_api_key:
          "98d76f167b22a0144b85deb4bbe7338d4df1b05ab8b4495062e892e1ad379602",
      },
    })
    .then(function (response) {
      res.status(200).send("authentication successful");
    })
    .catch(function (error) {
      //handle error here
    });
};

const pinFileToIPFS = (pinataApiKey, pinataSecretApiKey) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //we gather a local file from the API for this example, but you can gather the file from anywhere
  let data = new FormData();
  data.append("file", fs.createReadStream("./yourfile.png"));
  return axios
    .post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    .then(function (response) {
      //handle response here
    })
    .catch(function (error) {
      //handle error here
    });
};
