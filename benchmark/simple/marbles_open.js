/**
* Copyright 2017 HUAWEI. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict'

module.exports.info  = "opening marbles accounts";

var accounts = [];
var marblePostfix;
var originalOwner;
var newOwner;
var bc, contx;
module.exports.init = async function(blockchain, context, args) {

    // ==== Invoke marbles ====
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble1","blue","35","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble2","red","50","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble3","blue","70","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["transferMarble","marble2","jerry"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["transferMarblesBasedOnColor","blue","jerry"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["delete","marble1"]}'

// ==== Query marbles ====
// peer chaincode query -C myc1 -n marbles -c '{"Args":["readMarble","marble1"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getMarblesByRange","marble1","marble3"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getHistoryForMarble","marble1"]}'

    bc = blockchain;
    contx = context;
    marblePostfix = 0;
    originalOwner = "sunhwei";
    newOwner="shw100";
   /*
    for (let i=0; i<100; i++){
        marblePostfix++;
        await bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'initMarble', marbleName: "marble"+marblePostfix, color: "blue",size:"50",owner:"sunhwei"}, 30);
    }
   */ 
   return Promise.resolve();
}

module.exports.run = function() {

    let tempId= (marblePostfix++)%100;
      marblePostfix++;
    return bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'initMarble', marbleName: "marble"+marblePostfix, color: "blue",size:"50",owner:"sunhwei"}, 30);
     // return bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'transferMarble', marbleName: "marble"+tempId ,owner:"sunhwei"}, 30);
   
}

module.exports.end = async function(results) {
    marblePostfix=0;
    for (let i=0; i<100; i++){
        marblePostfix++;
       // await bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'initMarble', marbleName: "marble"+marblePostfix, color: "blue",size:"50",owner:"sunhwei"}, 30);
       // await bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'delete', marbleName: "marble"+marblePostfix }, 30);

    }
    return Promise.resolve();
}

