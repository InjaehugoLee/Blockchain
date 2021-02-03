const express = require('express');
const {v1:uuid}= require('uuid');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const bodyparser = require('body-parser');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));

router.get('/', function(req, res){
    res.send(bitcoin);
});

router.post('/', function(req, res){
    res.send(bitcoin);
});

router.post('/receive-new-block', function(req, res){
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.prevBlockHash;
    const correctIndex = lastBlock['index']+1 === newBlock['index'];
    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.newTransactions = [];
        res.json({
            note:'New block received and accepted.',
            newBlock:newBlock
        });
    }
    else{
        res.json({
            note:'New block rejected.',
            newBlock:newBlock
        });
    }
})

module.exports=router;