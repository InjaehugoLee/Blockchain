const express = require('express');
const {v1:uuid}= require('uuid');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const bodyparser = require('body-parser');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));
const nodeAddress = uuid().split('-').join('');
const rp = require('request-promise');

router.post('/', function(req, res){
    const lastBlock = bitcoin.getLastBlock();
    const prevBlockHash = lastBlock[`hash`];
    const curBlockData = {transaction:bitcoin.newTransactions, Index:lastBlock[`index`]+1};
    const nonce = bitcoin.proofOfWork(prevBlockHash, curBlockData);
    const blockHash = bitcoin.hashBlock(prevBlockHash, curBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash, blockHash);
    const requestPromises =[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions ={

            uri:networkNodeUrl + '/receive-new-block',
            method:'POST',
            body:{newBlock:newBlock},
            json:true
        };
        requestPromises.push(rp(requestOptions));
    })
    Promise.all(requestPromises).then(data=>{
        const requestOptions ={
            uri:bitcoin.currentNodeUrl + '/transaction/broadcast',
            method:'POST',
            body:{amount:12.5, sender:'00', recipient:nodeAddress},
            json:true
        };
        return rp(requestOptions);
    }).then(data=>{
        res.json({note:'New block mined & broadcast succesfully', block:newBlock});
    });
});

module.exports=router;