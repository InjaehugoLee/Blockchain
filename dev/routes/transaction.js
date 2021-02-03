const express = require('express');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const bodyparser = require('body-parser');
const rp = require('request-promise');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));

router.post('/', function(req, res){
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({note: `Transaction will be added in block ${blockIndex}`});
});

router.post('/broadcast', function(req, res){
    const newTransaction = bitcoin.createNewTransaction(
        req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            uri:networkNodeUrl + '/',
            method:'POST',
            body:newTransaction,
            json:true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(data=>{
        res.json({note:'Transaction created and broadcast succesfully.'});
    });
});

module.exports=router;