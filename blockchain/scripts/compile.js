const fs = require("fs");
const path = require("path");
const solc = require("solc");

const contractPath = path.join(
    __dirname,
    "..",
    "contracts",
    "CertificateRegistry.sol"
);

const source = fs.readFileSync(contractPath, "utf8");

const input = {
    language: "Solidity",
    sources: {
        "CertificateRegistry.sol": {
            content: source
        }
    },
    settings: {
        evmVersion: "paris",
        outputSelection: {
            "*": {
                "*": [
                    "abi",
                    "evm.bytecode"
                ]
            }
        }
    }
};

const output = JSON.parse(
    solc.compile(JSON.stringify(input))
);

if (output.errors) {
    for (const error of output.errors) {
        console.log(error.formattedMessage);
    }
}

const contract =
    output.contracts["CertificateRegistry.sol"]["CertificateRegistry"];

fs.writeFileSync(
    path.join(__dirname, "CertificateRegistryABI.json"),
    JSON.stringify(contract.abi, null, 2)
);

fs.writeFileSync(
    path.join(__dirname, "CertificateRegistryBytecode.json"),
    JSON.stringify(
        {
            bytecode: contract.evm.bytecode.object
        },
        null,
        2
    )
);

console.log("✅ CertificateRegistry compiled successfully!");
console.log("✅ ABI generated");
console.log("✅ Bytecode generated");