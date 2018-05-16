/**
* Copyright 2017 HUAWEI. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict'
const Util =require("../../src/comm/util");
module.exports.info  = "opening marbles accounts";

var accounts = [];
var marblePostfix;
var originalOwner;
var newOwner;
var bc, contx;
var ccName= "marbles_node";
var ccVersion ="v0";
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
   return Promise.resolve();
}

module.exports.run = function() {

    marblePostfix++;
    let tempTran =  {  
          "verb" : "initMarble",
          "marbleName" : "marble"+ marblePostfix,
          "color" : "blue",
          "size"  : "50",
          "owner" : "sunhwei" 
          };
    return bc.invokeSmartContract(contx, ccName, ccVersion,  tempTran,  100);
   
}

module.exports.end = async function(results) {
   // await Util.sleep(5000);
    return Promise.resolve();
}

