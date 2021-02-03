const express = require('express');
//const Blockchain = require('./Blockchain');
const port = process.argv[2];
const app = new express();
const bodyparser = require('body-parser');
//const bitcoin = new Blockchain();
const routerindex = require('./routes');
const routertransaction = require('./routes/transaction');
const register = require('./routes/register');
const mine = require('./routes/mine');
const consensus = require('./routes/consensus');
const block_explorer = require('./routes/explorer');

app.use('/', routerindex);
app.use('/transaction', routertransaction);
app.use('/register', register);
app.use('/mine', mine);
app.use('/consensus', consensus);
app.use('/explorer', block_explorer);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.get('/', function(req, res){
    res.send('Hello World!');
});

app.listen(port, function(){console.log(`listening on port ${port}..`)});