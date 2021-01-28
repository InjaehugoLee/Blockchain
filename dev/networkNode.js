const express = require('express');
const Blockchain = require('./Blockchain');
const {v1:uuid}= require('uuid');
const port = process.argv[2];
const rp = require('request-promise');
const app = new express();
const bodyparser = require('body-parser');
const requestPromise = require('request-promise');
const bitcoin = new Blockchain();
const nodeAddress = uuid().split('-').join('');

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
            body:{amount:12.5, sender:'00',recipient:nodeAddress},
            json:true
        };
        return rp(requestOptions);
    }).then(data=>{
        res.json({note:'New block mined & broadcast succesfully', block:newBlock});
    });
});

app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const regNodesPromises=[];
    if(bitcoin.networkNodes.indexOf(newNodeUrl)==-1)
        bitcoin.networkNodes.push(newNodeUrl);
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method:'POST',
            body:{newNodeUrl:newNodeUrl},
            json:true
        };
        regNodesPromises.push(rp(requestOption));
    });
    Promise.all(regNodesPromises).then(data=>{
        const bulkRegisterOptions ={
            uri: newNodeUrl + '/register-nodes-bulk',
            method:'POST',
            body:{allNetworkNodes:[...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
            json:true
        };
        return rp(bulkRegisterOptions);
    })
    .then(data=>{
        res.json({note: 'New node registered with network succesfully.'});
    })
});

app.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotExist = (bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    const notCurrentNode = bitcoin.currentNodeUrl!==newNodeUrl;
    if(nodeNotExist && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
    res.json({note: `New node registered successfully.`});
});

app.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=>{
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl)==-1;
        const notCurrentNode = bitcoin.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note: 'Bulk registration succesful.'});
});


app.post('/transaction', function(req, res){
    const newTransaction = req.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({note: `Transaction will be added in block ${blockIndex}`});
});

app.post('/transaction/broadcast', function(req, res){
    const newTransaction = bitcoin.createNewTransaction(
        req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            uri:networkNodeUrl + '/transaction',
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

app.post('/receive-new-block', function(req, res){
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

app.post('/consensus', function(req, res){
    const requestPromises =[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            uri:networkNodeUrl + '/blockchain',
            method:'POST',
            json:true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(blockchains=>{
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newTransactions = null;
        blockchains.forEach(blockchain=>{
            if(blockchain.chain.length>maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newTransactions = blockchain.newTransactions;
            };
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

app.get('/block/:blockHash', function(req, res){
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block:correctBlock
    });
});

app.get('/transaction/:transactionId', function(req, res){
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction:transactionData.transaction,
        block:transactionData.block
    });
});

app.get('/address/:address', function(req, res){
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData:addressData
    });
});

app.get('/block-explorer', function(req, res){
    res.sendFile(`./block-explorer/index.html`, {root:__dirname});
})

app.listen(port, function(){console.log(`listening on port ${port}..`)});