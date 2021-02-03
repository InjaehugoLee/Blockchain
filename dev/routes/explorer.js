const express = require('express');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const bodyparser = require('body-parser');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));

// 테스트시, http://localhost:3001/explorer/block-explorer로 실행

router.get('/block/:blockHash', function(req, res){
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block:correctBlock
    });
});

router.get('/transaction/:transactionId', function(req, res){
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction:transactionData.transaction,
        block:transactionData.block
    });
});

router.get('/address/:address', function(req, res){
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData:addressData
    });
});

router.get('/block-explorer', function(req, res){
    res.sendFile('./block-explorer/index.html', {root:__dirname});
});

module.exports=router;