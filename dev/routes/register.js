const express = require('express');
const router = express.Router();
const bitcoin = require('../Bitcoin');
const rp = require('request-promise');
const bodyparser = require('body-parser');
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({extended:false}));

router.post('/register-and-broadcast-node', function(req, res){
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

router.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotExist = (bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    const notCurrentNode = bitcoin.currentNodeUrl!==newNodeUrl;
    if(nodeNotExist && notCurrentNode)
        bitcoin.networkNodes.push(newNodeUrl);
    res.json({note: `New node registered successfully.`});
});

router.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=>{
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl)==-1;
        const notCurrentNode = bitcoin.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
            bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note: 'Bulk registration successful.'});
});

module.exports=router;
