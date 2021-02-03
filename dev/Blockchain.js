// SHA256 라이브러리 사용하기 위해 import
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const {v1:uuid}= require('uuid');

// 블록체인 생성자 함수
function Blockchain(){
    // 채굴한 모든 블록을 저장하는 배열 선언
    this.chain=[];
    // 블록에 아직 저장되지 않은 모든 트랜잭션을 저장하는 배열 선언
    this.newTransactions=[];
    this.createNewBlock(100,'0','0');
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
}

Blockchain.prototype.hashBlock = function(prevBlockHash, curBlockData, nonce){
    const dataString = prevBlockHash + nonce.toString() + JSON.stringify(curBlockData);
    const hash = sha256(dataString);
    return hash;
}

// 블록체인 생성자 함수에 createNeewBlock 메소드 추가
// nonce : 자격증명(POW)을 통해 찾아진 숫자 값
// prevBlockHash : 이전 블록에서 직전 블록까지 트랜잭션들의 해시값
// hash : 트랜잭션들의 해시값

Blockchain.prototype.createNewBlock=function(nonce, prevBlockHash, hash){
    const newBlock = {
        index : this.chain.length+1,            // 새로운 블록이 몇 번째 블록인지
        timestmap : Date.now(),                 // 블록이 생성된 시점
        transactions : this.newTransactions,    // 새로운 트랜잭션들과 미결 트랜잭션들이 추가됨.
        nonce : nonce,                          // 자격증명(POW)을 통해 찾아진 숫자 값
        hash : hash,                            // 트랜잭션들의 해시값
        prevBlockHash : prevBlockHash           // 이전 블록에서 직전 블록까지 트랜잭션들의 해시값
    };
    this.newTransactions=[];                // 새로운 블록을 만들 때 새로운 트랜잭션들을 저장할 배열을 초기화
    this.chain.push(newBlock);              // 새로운 블록을 체인에 추가
    return newBlock;                        // 새로운 블록을 반환
}

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
    const newTransaction ={
        amount : amount,
        sender : sender,
        recipient : recipient,
        transactionId : uuid().split('-').join('')
    };
    
    return newTransaction;
}

// Blockchain에서 제일 마지막 블록 반환
Blockchain.prototype.getLastBlock = function(){
    // 체인 배열에서 제일 마지막 블록을 반환
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.proofOfWork = function(prevBlockHash, curBlockData){
    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, curBlockData, nonce);
    while(hash.substring(0, 4)!=="0000"){
        nonce++;
        hash = this.hashBlock(prevBlockHash, curBlockData, nonce);
        
    }
    
    return nonce;
}

Blockchain.prototype.addTransactionToPendingTransactions = function(newTransaction){
    this.newTransactions.push(newTransaction);
    return this.getLastBlock()['index']+1;
}

Blockchain.prototype.chainIsValid = function(blockchain){
    let validChain = true;
    for(var i=1; i<blockchain.length; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(prevBlock['hash'], {transaction : currentBlock['transactions'], Index:currentBlock['index']}, currentBlock['nonce']);
        if(blockHash.substring(0, 4)!=='0000')
            validChain = false;
        if(currentBlock['prevBlockHash']!==prevBlock['hash'])
            validChain = false;
    };
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce']===100;
    const correctPreviousBlockHash = genesisBlock['prevBlockHash']==='0';
    const correctHash = genesisBlock['hash']==='0';
    const correctTransactions = genesisBlock['transactions'].length ===0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions)
        validChain = false;
    return validChain;
}

Blockchain.prototype.getBlock =function(blockHash){
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash===blockHash)
            correctBlock = block;
    });
    return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId){
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if(transaction.transactionId===transactionId){
                correctTransaction=transaction;
                correctBlock=block;
            };
        });
    });
    return {
        transaction: correctTransaction,
        block: correctBlock
    };
};

Blockchain.prototype.getAddressData=function(address){
    const addressTransactions =[];
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if(transaction.sender===address || transaction.recipient ===address){
                addressTransactions.push(transaction);
            };
        });
    });
    let balance = 0;
    addressTransactions.forEach(transaction =>{
        if(transaction.recipient ===address) balance += transaction.amount;
        else if(transaction.sender ===address) balance -= transaction.amount;
    });
    return {
        addressTransactions:addressTransactions,
        addressBalance:balance
    };
};

module.exports = Blockchain;