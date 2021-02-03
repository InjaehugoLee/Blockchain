const express = require('express');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const bodyparser = require('body-parser');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));

router.get('/', function(req, res){
    const requestPromises =[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            uri:networkNodeUrl + '/blockchain',
            method:'GET',
            json:true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(blockchains=>{
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newTransactions = bitcoin.newTransactions;

        blockchains.forEach(blockchain=>{
            if(blockchain.chain.length>maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newTransactions = blockchain.newTransactions;
            }
            else if(blockchain.chain.length==maxChainLength){
                console.log(blockchain);
                //console.log(blockchain.newTransactions);
                if(newTransactions.length<blockchain.newTransactions.length){
                    newLongestChain = blockchain.chain;
                    newTransactions=blockchain.newTransactions;
                }
            }
        });

        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
            res.json({
                note:'Current chain has not been replaced.',
                chain:bitcoin.chain
            });
        }
        else{
            bitcoin.chain = newLongestChain;
            bitcoin.newTransactions = newTransactions;
            res.json({
                note:'This chain has been replaced.',
                chain:bitcoin.chain
            });
        }
    });
});

module.exports=router;
