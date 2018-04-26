/**
* Copyright 2018 IBM. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*  Fund-clearing Network
*  This executes a fund transfer between the participating banks through a Transaction
*  - Example test round
*      {
*        "label" : "fund-clearing-network",
*        "txNumber" : [50],
*        "rateControl" : [{"type": "fixed-rate", "opts": {"tps" : 10}}],
*        "arguments": {"testAssets": 50},
*        "callback" : "benchmark/composer/composer-samples/fund-clearing-network.js"
*      }
*  - Init:
*    - Creates 2 bank Particpants
*    - Test specified number of Assets(banks) created, and each bank participants submitted 4 
*      TransferRequest assets 
*  - Run:
*   -  bank1 participants submiited 10 transfer request to bank2  through test
*
*/

'use strict'

module.exports.info  = "Fund-clearing Network Performance Test";

const composerUtils = require('../../../src/composer/composer_utils');
var bc;
var adminNetConnection;
var busNetConnections;  // Global map of all business network connections to be used
var testAssetNum;
var busFactory;
//var userName = 'BankID00_1';
var userName= 'BankName1';

const namespace = 'org.clearing';
const busNetName = 'fund-clearing-network';
var currPartcipant={};
var globalTransferID=160;

let myQuery;
let qryRef = 0;



module.exports.init = async function(blockchain, context, args) {
    // Create Participants and Assets to use in main test    
    bc = blockchain;

    busNetConnections = new Map();
    busNetConnections.set('admin', context);

    adminNetConnection = context;
    testAssetNum = args.testAssets;
    try {
         
      //  let partipantReg = await busNetConnections.get('admin').getParticipantRegistry(namespace + '.BankingParticipant');
        const cardName = `PerfUser${userName}@${busNetName}`;
        
           
        let newConnection = await composerUtils.getBusNetConnection(cardName);
        
        busNetConnections.set(userName, newConnection);

        const assetRegistry = await busNetConnections.get(userName).getAssetRegistry(namespace + '.TransferRequest');
        const allAssets = await assetRegistry.getAll();
        console.log("Total TransferRequest asset numner="+allAssets.length);
        allAssets.forEach((assetItem)=> {
          //  console.log(`....AssetRequestId=${assetItem.requestId}`);
          //  console.log(`....AssetFromBank=${assetItem.fromBank}`);
          //  console.log(`....AssetToBank=${assetItem.toBank}`);
        });

       // myQuery = busNetConnections.get(userName).buildQuery('SELECT org.acme.sample.SampleAsset WHERE (owner == _$inputValue)');
        myQuery = busNetConnections.get(userName).buildQuery('SELECT org.clearing.TransferRequest WHERE (fromBank == _$bank)');

        return Promise.resolve();
    

    }catch (error) {
        console.log('error in test init: ', error);
        return Promise.reject(error);
    }

}

module.exports.run = function() {
    let submitTime = Date.now();   
    let invoke_status = {
        id           : qryRef,
        status       : 'created',
        time_create  : submitTime,
        time_final   : 0,
        time_endorse : 0,
        time_order   : 0,
        result       : null
    }; 
    //return busNetConnections.get(userName).query(myQuery, { bank: 'resource:org.clearing.BankingParticipant#Bank00_0'})
    return busNetConnections.get(userName).query(myQuery, { bank: 'resource:org.clearing.BankingParticipant#Bank00_0'})
    .then((result) => {
        
     //   console.log("QUery result="+result);
        invoke_status.status = 'success';
        invoke_status.time_final = Date.now();
        qryRef++;
        return Promise.resolve(invoke_status);
    })
    .catch((err) => {
        invoke_status.time_final = Date.now();
        invoke_status.status = 'failed';
        console.log("error from query =="+err);
        return Promise.resolve(invoke_status);
    });  
}

module.exports.end = async function(results) {
 
   
    console.log('Query completed  .......... qryRef='+qryRef );
    
    return Promise.resolve(true);
};

function _createTransferAsset(factory, transferId, ammount, currency, globalState, fromBank, toBank) {
    let asset = factory.newResource(namespace, 'TransferRequest', transferId);
    let transfer = factory.newConcept(namespace, 'Transfer');
    transfer.ammount = ammount;
    transfer.fromAccount = 1234567;
    transfer.toAccount = 789123;
    transfer.currency = currency;
    asset.details = transfer;
    asset.fromBankState = 'PENDING';
    asset.toBankState = 'PENDING';
    asset.state = globalState;
    asset.fromBank = factory.newRelationship(namespace, 'BankingParticipant', fromBank);
    asset.toBank = factory.newRelationship(namespace, 'BankingParticipant', toBank);
    return asset;
}

