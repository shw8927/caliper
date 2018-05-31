/**
* Copyright 2017 HUAWEI. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict'

module.exports.info  = "opening marbles accounts";

const Util =require("../../src/comm/util");
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
  await Util.sleep(5000); 
   return Promise.resolve();
}

module.exports.run = function() {

     marblePostfix++; 
     let tempTran =  {
          "verb" : "transferMarble",
          "marbleName" : "marble"+ marblePostfix,
          "owner" : "sunhweiX"
          };
    return bc.invokeSmartContract(contx, ccName, ccVersion,  tempTran,  150);

}

module.exports.end = async function(results) {
     await Util.sleep(5000);
    return Promise.resolve();
}

