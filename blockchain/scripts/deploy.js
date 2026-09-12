const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545");

const abi = JSON.parse(
    fs.readFileSync(
        "./scripts/CertificateRegistryABI.json",
        "utf8"
    )
);

const bytecodeData = JSON.parse(
    fs.readFileSync(
        "./scripts/CertificateRegistryBytecode.json",
        "utf8"
    )
);

const bytecode = bytecodeData.bytecode;

async function deploy() {
    try {
        const accounts = await web3.eth.getAccounts();

        console.log("Deploying from:", accounts[0]);

        const contract = new web3.eth.Contract(abi);

        const deployedContract = await contract
            .deploy({
                data: "0x" + bytecode
            })
            .send({
                from: accounts[0],
                gas: 3000000
            });

        console.log("\n✅ Contract deployed successfully!");
        console.log("Contract Address:");
        console.log(deployedContract.options.address);
    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error);
    }
}

deploy();