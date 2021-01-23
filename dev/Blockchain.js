// SHA256 라이브러리 사용하기 위해 import
const sha256 = require('sha256');

Blockchain.prototype.hashBlock = function(prevBlockHash, curBlockData, nonce){
    const dataString = prevBlockHash + nonce.toString() + JSON.stringify(curBlockData);
    const hash = sha256(dataString);
    return hash;
}

// 블록체인 생성자 함수
function Blockchain(){
    // 채굴한 모든 블록을 저장하는 배열 선언
    this.chain=[];
    // 블록에 아직 저장되지 않은 모든 트랜잭션을 저장하는 배열 선언
    this.newTransactions=[];
    this.createNewBlock(100,'0','0');
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
        prevBlockHash : prevBlockHash,            // 이전 블록에서 직전 블록까지 트랜잭션들의 해시값
    }
    this.newTransactions=[];                // 새로운 블록을 만들 때 새로운 트랜잭션들을 저장할 배열을 초기화
    this.chain.push(newBlock);              // 새로운 블록을 체인에 추가
    return newBlock;                        // 새롱누 블록을 반환
}

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
    const newTransaction ={
        amount : amount,
        sender : sender,
        recipient : recipient,
    };
    this.newTransactions.push(newTransaction);
    return this.getLastBlock()['index']+1;
}

// Blockchain에서 제일 마지막 블록 반환
Blockchain.prototype.getLastBlock = function(){
    // 체인 배열에서 제일 마지막 블록을 반환
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.proofOfWork = function(prevBlockHash, curBlockData){
    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, curBlockData, nonce);
    while(hash.substring(0, 3)!=="000"){
        nonce++;
        hash = this.hashBlock(prevBlockHash, curBlockData, nonce);
        //console.log(hash);
        process.stdout.write(hash + '\r');
    }
    process.stdout.write('\n');
    return nonce;
}

module.exports = Blockchain;