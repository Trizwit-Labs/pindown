//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Pindown {
    struct doc {
        bool valid;
        address issuer;
        address receiver;
        string doclink;
        string cid;
    }

    // Creating a mapping
    mapping(string => doc) public certificates;

    function addCert(
        string memory _certificateid,
        string memory _doclink,
        address _receiver
    ) public {
        // check if certificate has been issued
        require(
            !certificates[_certificateid].valid,
            "Certificate has already been issued"
        );
        certificates[_certificateid].cid = _certificateid;
        certificates[_certificateid].doclink = _doclink;
        certificates[_certificateid].issuer = msg.sender;
        certificates[_certificateid].receiver = _receiver;
        certificates[_certificateid].valid = true;
    }

    function getCert(string memory _certificateid)
        public
        view
        returns (
            string memory,
            string memory,
            address,
            address
        )
    {
        // check if certificate has been issued
        require(
            certificates[_certificateid].valid,
            "Certificate has not been issued"
        );
        string memory _cid = certificates[_certificateid].cid;
        string memory _doclink = certificates[_certificateid].doclink;
        address _issuer = certificates[_certificateid].issuer;
        address _receiver = certificates[_certificateid].receiver;

        return (_cid, _doclink, _issuer, _receiver);
    }
}
