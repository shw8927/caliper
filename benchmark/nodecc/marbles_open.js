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
    return bc.invokeSmartContract(contx, ccName, ccVersion,  tempTran,  150);
   
}

module.exports.end = async function(results) {
    return Promise.resolve();
}

