const Blockchain = require('./Blockchain');
var bitcoin = new Blockchain();
const {v1:uuid}= require('uuid');
var nodeAddress = uuid().split('-').join('');

const express = require('express');
var app = new express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.get('/', function(req, res){
    res.send('Hello World!');
});
app.get('/blockchain', function(req, res){
    res.send(bitcoin);
});

app.post('/blockchain', function(req, res){
    res.send(bitcoin);
});
app.post('/mine', function(req, res){
    const lastBlock = bitcoin.getLastBlock();
    const prevBlockHash = lastBlock[`hash`];
    const curBlockData = {transaction:bitcoin.newTransactions, Index:lastBlock[`index`]+1};
    const nonce = bitcoin.proofOfWork(prevBlockHash, curBlockData);
    const blockHash = bitcoin.hashBlock(prevBlockHash, curBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash, blockHash);
    res.json({note:"New block mined successfully", block:newBlock});
    bitcoin.createNewTransaction(15, "00", nodeAddress);
});

app.post('/transaction', function(req, res){
	const blockIndex = bitcoin.createNewTransaction(
		req.body.amount,
		req.body.sender,
		req.body.recipient)
	res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

app.listen(3000, function(){console.log('listening on port 3000..')});

