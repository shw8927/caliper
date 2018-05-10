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
*        "arguments": {"participantBankNumber":3,"transferReqPerBank": 7},
*        "callback" : "benchmark/composer/composer-samples/fund-clearing-network.js"
*      }
*  - Init:
*    - Creates #participantBankNumber  bank Particpants,and created connection for each participants 
*    - Test specified number of Assets(banks) created, and each bank participants submitted 4 
*      TransferRequest assets 
*  - Run:
*   -  bank1 participants submiited 10 transfer request to bank2  through test
*
*/

'use strict'

module.exports.info  = "Fund-clearing Network Performance Test";

const composerUtils = require('../../../src/composer/composer_utils');
const AdminConnection = require('composer-admin').AdminConnection;
const namespace = 'org.clearing';
const busNetName = 'fund-clearing-network';

var bc;
var adminNetConnection;
var busNetConnections;  // Global map of all business network connections to be used
var busFactory;
var testBankNum = 0;
var testTransferReqPerbank = 0; 
var bankIdPrefix = "BankIdR0_";
var bankNamePrefix= "BankNameR0_";

var globalTransferID = 160;
var globalBankNumber = 100;
var globalBatchID = 0;

module.exports.init = async function(blockchain, context, args) {
    // Create Participants and Assets to use in main test    
    bc = blockchain;

    busNetConnections = new Map();
    busNetConnections.set('admin', context);
    adminNetConnection = context;
    testBankNum = args.participantBankNumber;
    testTransferReqPerbank = args.transferReqPerBank;
      bankIdPrefix =args.bankIdPrefix;
    bankNamePrefix =args.bankNamePrefix;
    
    //step1:  Parameter check
    if ((testBankNum < 1) || (testTransferReqPerbank < 1 )) {
        console.log('error in test init: arguments error, participantBankNumber= %s, transferReqPerBank=%s ',
         testBankNum,testTransferReqPerbank );
        return Promise.reject('error in test init: arguments error');
    }
    console.log("init parameter check finished"); 

    //step 2: create participants 
    try {
        console.log("Create bankParticipants ........");
        busFactory = adminNetConnection.getBusinessNetwork().getFactory();
        let participantRegistry = await adminNetConnection.getParticipantRegistry(namespace + '.BankingParticipant')
    
        let bankparticipants = new Array();
        
        for (let i=0; i<testBankNum; i++) {
            let bankPartipant = busFactory.newResource(namespace, 'BankingParticipant', bankIdPrefix + i.toString());
            bankPartipant.bankingName = bankNamePrefix+i.toString();
            bankPartipant.workingCurrency = 'USD';
            bankparticipants.push(bankPartipant);
        }
        await participantRegistry.addAll(bankparticipants);

        console.log("create connection cards for new participants ...");

        let participants = await participantRegistry.getAll();
        for (let partIndex=0; partIndex < participants.length; partIndex++){
            console.log("Current participant name=",participants[partIndex].bankingName);
            if (participants[partIndex].bankingName.indexOf(bankNamePrefix) != -1){
                console.log(" new bankXXXX  got it , .....")
            let newConnection = await composerUtils.obtainConnectionForParticipant(adminNetConnection, busNetName, participants[partIndex], participants[partIndex].bankingName);
             busNetConnections.set(participants[partIndex].bankingName, newConnection);
            }

        }

        //step 3: check identity for participants  
        let idReg = await adminNetConnection.getIdentityRegistry();
        let ids= await idReg.getAll();
        for (let j=0; j<ids.length; j++) {
            let idx=ids[j];
            console.log("current identifier NO.=",j);
            console.log(`IdentityName=${idx.name},IdentityState=${idx.state}, IdentityIssuer=${idx.issuer}, IdentityID=${idx.identityId},`);
         }

         //step 4 : create 8 transferRequest assets 
         let transferRegistry = await  adminNetConnection.getAssetRegistry(namespace + '.TransferRequest');
         let assetIdPrefix="transferR";
         
         for (let i =0 ;i < 10; i=i+3 ){
            let asset0 = _createTransferAsset(busFactory, assetIdPrefix+i.toString(), 100, 'EURO', 'PENDING',bankIdPrefix+"0" , bankIdPrefix+"2");
            let asset1 = _createTransferAsset(busFactory, assetIdPrefix+(i+1).toString(), 200, 'STERLING', 'PENDING',bankIdPrefix+"2" , bankIdPrefix+"1");
            let asset2 = _createTransferAsset(busFactory, assetIdPrefix+(i+2).toString(), 100, 'EURO', 'PENDING',bankIdPrefix+"1" , bankIdPrefix+"0");
            await  transferRegistry.addAll([asset0,asset1,asset2]);

         } 
    
    await     _invokeCreateBatchTX(bankNamePrefix+'1');
    console.log('TransferAsset addition complete');
    console.log('=======In init section ========');
    await _showAllTransferRequest('admin');
    await _showAllBatchTransferRequest('admin');;

    return Promise.resolve();
    }catch (error) {
        console.log('error in test init: ', error);
        return Promise.reject(error);
    }

}

module.exports.run = async function() {
   
    //return _createBankParticipant(adminNetConnection);
    //return _testCreateTransferRequestAsset('BankName1');
    return _invokeCreateBatchTX(bankNamePrefix+'0');

    /*
    let busFactory = busNetConnections.get('BankName1').getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'CreateBatch');
    let rate1 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate1.to = 'EURO';
    rate1.rate = 0.75;
    let rate2 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate2.to = 'STERLING';
    rate2.rate = 1.75;
    txn.usdRates = [rate1, rate2];
    txn.batchId="BATCH00_"+globalBatchID;
    globalBatchID++;
    console.log("IN create batch TX, current batchid=",txn.batchId);
    return bc.bcObj.submitTransaction(busNetConnections.get('BankName1'), txn);
   */
};

module.exports.end = async function(results) {
    console.log("=========== In End section ============");
    /*** *
    await _invokeMarkPreProcessCompleteTX('BankNameX0','BATCH00_0:BankID00_X10');
    await _invokeMarkPreProcessCompleteTX('BankNameX1','BATCH00_0:BankID00_X10');
    await _invokeCompleteSettlementTX('BankNameX0','BATCH00_0:BankID00_X10');
    await _invokeMarkPostProcessCompleteTX('BankNameX0','BATCH00_0:BankID00_X10');
    await _invokeMarkPostProcessCompleteTX('BankNameX1','BATCH00_0:BankID00_X10');
    ***/
    //step 1 disconnect all bankeParticpant connections
   for (var key of  busNetConnections.keys()) {
       if (key !='admin'){
        await busNetConnections.get(key).disconnect();
        console.log("Connection " + key +" is closed" );
       }
   }

   let connectionName='admin';

   console.log("======before delete all .TransferRequest =========")

    await  _removeAllAssets(connectionName,namespace+".TransferRequest");

    await _showAllBatchTransferRequest(connectionName);
    console.log("======before delete all .BatchTransferRequest =========")

    await  _removeAllAssets(connectionName,namespace+".BatchTransferRequest");

     //step 3: remove all  identity for participants  
    let idReg = await adminNetConnection.getIdentityRegistry();
    let ids= await idReg.getAll();
    for (let j=0; j<ids.length; j++) {
        let idx=ids[j];
        console.log("current identifier NO.=",j);
        console.log(`IdentityName=${idx.name},IdentityState=${idx.state}, IdentityIssuer=${idx.issuer}, IdentityID=${idx.identityId},`);
      if ((idx.name !='admin') && (idx.state !="REVOKED")){
        await adminNetConnection.revokeIdentity(idx.identityId);
        console.log(idx.identityId +" is revoked");
        }
    }

   //step4  remove all particiapants 
    let participantRegistry = await adminNetConnection.getParticipantRegistry(namespace + '.BankingParticipant')
    let participants = await participantRegistry.getAll();
    await participantRegistry.removeAll(participants);

      //step 5 delete all cards of participants 
    let  adminConnection = new AdminConnection();
    console.log("participants length="+ participants.length);
     for (let partIndex in participants){
       console.log("current participant="+partIndex);
       let userID=participants[partIndex].bankingName;
       const cardName = `PerfUser${userID}@${busNetName}`;
       console.log("card name="+cardName);
       let exists = await adminConnection.hasCard(cardName);  
             
       if (exists) {
           console.log('Delete existing business network user card: ', cardName);
           await adminConnection.deleteCard(cardName);
        }
    }

    return Promise.resolve(true);
};

function _createTransferAsset(factory, transferId, amount, currency, globalState, fromBank, toBank) {
    let asset = factory.newResource(namespace, 'TransferRequest', transferId);
  // let asset = factory.newResource(namespace, 'TransferRequest','',{allowEmptyId:true});
    let transfer = factory.newConcept(namespace, 'Transfer');
    transfer.amount = amount;
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

async function _removeAllAssets(connectionName,assetName){
    
    let assetRegistry = await  busNetConnections.get(connectionName).getAssetRegistry(assetName);
    let assets= await assetRegistry.getAll();
    console.log("before delete Totoal transferRequest asset Number =",assets.length);
     await assetRegistry.removeAll(assets);
     assets= await assetRegistry.getAll();
    console.log("after delete Totoal transferRequest asset Number =",assets.length);

}
async function  _createTransferRequestAsset(connectionName) {
   let transferRegistryX = await  busNetConnections.get(connectionName).getAssetRegistry(namespace + '.TransferRequest');
   let busFactoryX = busNetConnections.get(userName).getBusinessNetwork().getFactory();
   let assetTemp = _createTransferAsset(busFactoryX, "TransR_"+globalTransferID, 200, 'USD', 'PENDING', bankIdPrefix+"1" , bankIdPrefix+"2");
  
    globalTransferID++;
    let invoke_status = {
    id           : globalTransferID.toString(),
    status       : 'created',
    time_create  : Date.now(),
    time_final   : 0,
    time_endorse : 0,
    time_order   : 0,
    result       : null
};
   await transferRegistryX.addAll([assetTemp]); 
   invoke_status.status = 'success';
   invoke_status.time_final = Date.now();   
   return Promise.resolve(invoke_status);

}  

async  function _createBatchTransferRequestAsset(connectionName){
    let busFactory = busNetConnections.get(connectionName).getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'MarkPostProcessComplete');
    txn.batchId = batchId;
    return bc.bcObj.submitTransaction(busNetConnections.get(connectionName), txn);

}

async function _createBankParticipant(adminNetConnection){
    let busFactory = adminNetConnection.getBusinessNetwork().getFactory();
    let participantRegistry = await adminNetConnection.getParticipantRegistry(namespace + '.BankingParticipant')

    let bankPartipant = busFactory.newResource(namespace, 'BankingParticipant', bankIdPrefix + globalBankNumber.toString());
    bankPartipant.bankingName = bankNamePrefix + globalBankNumber.toString();
    bankPartipant.workingCurrency = 'USD';

    let invoke_status = {
        id           : globalTransferID.toString(),
        status       : 'created',
        time_create  : Date.now(),
        time_final   : 0,
        time_endorse : 0,
        time_order   : 0,
        result       : null
    };
   try{
       await participantRegistry.add(bankparticipant);
       invoke_status.status = 'success';
       invoke_status.time_final = Date.now(); 
   }catch (error) {
       console.log('error in create bankParticipant: ', error);
       invoke_status.status = 'success';
       invoke_status.time_final = Date.now(); 
    } 
   return Promise.resolve(invoke_status);
}
async function _invokeCreateBatchTX(connectionName){
    let busFactory = busNetConnections.get(connectionName).getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'CreateBatch');
    let rate1 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate1.to = 'EURO';
    rate1.rate = 0.75;
    let rate2 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate2.to = 'STERLING';
    rate2.rate = 1.75;
    txn.usdRates = [rate1, rate2];
    txn.batchId="BATCH00_"+globalBatchID;
    globalBatchID++;
    console.log("IN create batch TX, current batchid=",txn.batchId);
    return bc.bcObj.submitTransaction(busNetConnections.get(connectionName), txn);
  
}

async function _invokeMarkPreProcessCompleteTX(connectionName,batchId){
    let busFactory = busNetConnections.get(connectionName).getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'MarkPreProcessComplete');
    txn.batchId = batchId;
    return bc.bcObj.submitTransaction(busNetConnections.get(connectionName), txn);

}

async function _invokeMarkPostProcessCompleteTX(connectionName,batchId){
    let busFactory = busNetConnections.get(connectionName).getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'MarkPostProcessComplete');
    txn.batchId = batchId;
    return bc.bcObj.submitTransaction(busNetConnections.get(connectionName), txn);

}

async function _invokeCompleteSettlementTX(connectionName,batchId){
    let busFactory = busNetConnections.get(connectionName).getBusinessNetwork().getFactory();
    let txn = busFactory.newTransaction(namespace, 'CompleteSettlement');
    let rate1 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate1.to = 'EURO';
    rate1.rate = 0.75;
    let rate2 = busFactory.newConcept(namespace, 'UsdExchangeRate');
    rate2.to = 'STERLING';
    rate2.rate = 1.75;
    txn.usdRates = [rate1, rate2];
    txn.batchId = batchId;
    return bc.bcObj.submitTransaction(busNetConnections.get(connectionName), txn);

}

async function  _showAllTransferRequest(connectionName){
  
    let transferRassetReg = await  busNetConnections.get(connectionName).getAssetRegistry(namespace + '.TransferRequest');
    let transAssets= await transferRassetReg.getAll();
    console.log("Totoal transferRequest asset Number=",transAssets.length);
    transAssets.forEach((assetItem)=> {
       console.log(`TransferRequestId=${assetItem.requestId},TransferRequst status=${assetItem.state} `);
      
      });

} 

async function _showAllBatchTransferRequest(connectionName){
    let assetReg = await  busNetConnections.get(connectionName).getAssetRegistry(namespace + '.BatchTransferRequest');
   // BatchTransferRequest
    let assets= await assetReg.getAll();
    console.log("Total BatchTransfer Request number= ",assets.length);
    assets.forEach((assetItem)=> {
      //  console.log(`assetId=${assetItem.requestId}`);
      console.log("BatchRequest batchId=%s, status=%s",assetItem.batchId, assetItem.state);
      
    });
}
