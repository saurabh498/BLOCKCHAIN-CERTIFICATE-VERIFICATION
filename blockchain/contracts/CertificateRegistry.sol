// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {

    struct Certificate {
        string certificateId;
        string certificateHash;
        address issuer;
        uint256 timestamp;
        bool revoked;
    }

    mapping(string => Certificate) private certificates;

    event CertificateRegistered(
        string certificateId,
        string certificateHash,
        address issuer,
        uint256 timestamp
    );

    event CertificateRevoked(
        string certificateId,
        uint256 timestamp
    );

    function registerCertificate(
        string memory certificateId,
        string memory certificateHash
    ) public {

        require(
            bytes(certificates[certificateId].certificateId).length == 0,
            "Certificate already registered"
        );

        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            certificateHash: certificateHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            revoked: false
        });

        emit CertificateRegistered(
            certificateId,
            certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    function getCertificate(
        string memory certificateId
    )
        public
        view
        returns (
            string memory,
            string memory,
            address,
            uint256,
            bool
        )
    {
        Certificate memory certificate = certificates[certificateId];

        require(
            bytes(certificate.certificateId).length != 0,
            "Certificate not found"
        );

        return (
            certificate.certificateId,
            certificate.certificateHash,
            certificate.issuer,
            certificate.timestamp,
            certificate.revoked
        );
    }

    function revokeCertificate(
        string memory certificateId
    ) public {

        require(
            bytes(certificates[certificateId].certificateId).length != 0,
            "Certificate not found"
        );

        require(
            certificates[certificateId].issuer == msg.sender,
            "Only issuer can revoke"
        );

        certificates[certificateId].revoked = true;

        emit CertificateRevoked(
            certificateId,
            block.timestamp
        );
    }
}