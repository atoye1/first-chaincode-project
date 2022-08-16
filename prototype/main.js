'use strict';

var express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');

var app = express();

var path = require('path');
var fs = require('fs');

// static /public -> ./public
app.use('/public', express.static(path.join(__dirname,'public')));

// body-parser app.use
app.use(express.urlencoded({ extended : false}));
app.use(express.json());

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

const ccp = buildCCPOrg1();
const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

app.post('/asset', async(req, res) =>{
    var name = req.body.key;
    var color = req.body.value;

    console.log("/asset post start -- ", key, value);
    const gateway = new Gateway();

    try {
        const wallet = await buildWallet(Wallets, walletPath);

        await gateway.connect(ccp, {
            wallet,
            identity: "appUser",
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("simpleasset");
        await contract.submitTransaction('Set',key, name);

    } catch (error) {
        var result = `{"result":"fail", "message":"tx has NOT submitted"}`;
        var obj = JSON.parse(result);
        console.log("/asset end -- failed ", error);
        res.status(200).send(obj);
        return;
    }finally {
         gateway.disconnect();
    }

    var result = `{"result":"success", "message":"tx has submitted"}`;
    var obj = JSON.parse(result);
    console.log("/aset end -- success");
    res.status(200).send(obj);
});

app.get('/asset', async(req, res) =>{
    var name = req.query.key;
    console.log("/asset get start -- ", name);

    const gateway = new Gateway();

    try {
        const wallet = await buildWallet(Wallets, walletPath);
		// GW -> connect -> CH -> CC -> submitTransaction
        await gateway.connect(ccp, {
            wallet,
            identity: "appUser",
            discovery: { enabled: true, asLocalhost: true } 
        });
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("simpleasset");
        var result = await contract.evaluateTransaction('Get',key);
        // result 가 byte array라고 생각하고
        var result = `{"result":"success", "message":${result}}`;
        console.log("/asset get end -- success", result);
        var obj = JSON.parse(result);
        res.status(200).send(obj);
    } catch (error) {
        var result = `{"result":"fail", "message":"Get has a error"}`;
        var obj = JSON.parse(result);
        console.log("/asset get end -- failed ", error);
        res.status(200).send(obj);
        return;
    } finally {
        gateway.disconnect();
    }
});

// server listen
app.listen(3000, () => {
    console.log('Express server is started: 3000');
});
