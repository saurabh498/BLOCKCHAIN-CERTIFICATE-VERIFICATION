import json
import os

from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

GANACHE_URL = os.getenv(
    "GANACHE_URL",
    "http://127.0.0.1:7545"
)

CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS"
)

PRIVATE_KEY = os.getenv(
    "BLOCKCHAIN_PRIVATE_KEY"
)

w3 = Web3(
    Web3.HTTPProvider(GANACHE_URL)
)

if not w3.is_connected():
    raise Exception(
        "Could not connect to Ganache"
    )

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

ABI_PATH = os.path.join(
    BASE_DIR,
    "..",
    "blockchain",
    "scripts",
    "CertificateRegistryABI.json"
)

with open(ABI_PATH, "r") as file:
    CONTRACT_ABI = json.load(file)

contract = w3.eth.contract(
    address=Web3.to_checksum_address(
        CONTRACT_ADDRESS
    ),
    abi=CONTRACT_ABI
)


def register_certificate_on_blockchain(
    certificate_id: str,
    certificate_hash: str
):
    account = w3.eth.account.from_key(
        PRIVATE_KEY
    )

    nonce = w3.eth.get_transaction_count(
        account.address
    )

    transaction = contract.functions.registerCertificate(
        certificate_id,
        certificate_hash
    ).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 300000,
        "gasPrice": w3.eth.gas_price,
        "chainId": w3.eth.chain_id
    })

    signed_transaction = w3.eth.account.sign_transaction(
        transaction,
        private_key=PRIVATE_KEY
    )

    transaction_hash = w3.eth.send_raw_transaction(
        signed_transaction.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        transaction_hash
    )

    return {
        "transaction_hash": transaction_hash.hex(),
        "block_number": receipt.blockNumber,
        "contract_address": CONTRACT_ADDRESS
    }


def get_certificate_from_blockchain(
    certificate_id: str
):
    certificate = contract.functions.getCertificate(
        certificate_id
    ).call()

    return {
        "certificate_id": certificate[0],
        "certificate_hash": certificate[1],
        "issuer": certificate[2],
        "timestamp": certificate[3],
        "revoked": certificate[4]
    }

def test_blockchain_connection():
    return {
        "connected": w3.is_connected(),
        "chain_id": w3.eth.chain_id,
        "contract_address": CONTRACT_ADDRESS,
    }

def revoke_certificate_on_blockchain(
    certificate_id: str
):
    account = w3.eth.account.from_key(
        PRIVATE_KEY
    )

    nonce = w3.eth.get_transaction_count(
        account.address
    )

    transaction = contract.functions.revokeCertificate(
        certificate_id
    ).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 200000,
        "gasPrice": w3.eth.gas_price,
        "chainId": w3.eth.chain_id
    })

    signed_transaction = w3.eth.account.sign_transaction(
        transaction,
        private_key=PRIVATE_KEY
    )

    transaction_hash = w3.eth.send_raw_transaction(
        signed_transaction.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        transaction_hash
    )

    return {
        "transaction_hash": transaction_hash.hex(),
        "block_number": receipt.blockNumber,
        "contract_address": CONTRACT_ADDRESS
    }