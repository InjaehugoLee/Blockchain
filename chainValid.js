const Blockchain = require('./dev/Blockchain');
const bitcoin = new Blockchain();

const bc1 = 
{
    "chain": [
        {
            "index": 1,
            "timestmap": 1611643972958,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "prevBlockHash": "0"
        },
        {
            "index": 2,
            "timestmap": 1611643988274,
            "transactions": [],
            "nonce": 112088,
            "hash": "0000356b4561249916210c6e146f364bf04fe3a1562ba151ea9d507397f833ef",
            "prevBlockHash": "0"
        },
        {
            "index": 3,
            "timestmap": 1611643989067,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "1ca18ef05fa311eba1d2d3ad1bac182c",
                    "transactionId": "25c530405fa311eba1d2d3ad1bac182c"
                }
            ],
            "nonce": 22608,
            "hash": "000076b5b075ee6fff2705751c90f0533ca7ceb5670c2bef978ff4455f936171",
            "prevBlockHash": "0000356b4561249916210c6e146f364bf04fe3a1562ba151ea9d507397f833ef"
        },
        {
            "index": 4,
            "timestmap": 1611643990647,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "1ca18ef05fa311eba1d2d3ad1bac182c",
                    "transactionId": "263bbfd05fa311eba1d2d3ad1bac182c"
                }
            ],
            "nonce": 69299,
            "hash": "0000ec10649962142a1c65985f9d9f745c2e4684d3f8f9d67e028aa1563d4341",
            "prevBlockHash": "000076b5b075ee6fff2705751c90f0533ca7ceb5670c2bef978ff4455f936171"
        }
    ],
    "newTransactions": [
        {
            "amount": 12.5,
            "sender": "00",
            "recipient": "1ca18ef05fa311eba1d2d3ad1bac182c",
            "transactionId": "272cfda05fa311eba1d2d3ad1bac182c"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
}
   
console.log('Valid:', bitcoin.chainIsValid(bc1.chain));   
