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


    bc = blockchain;
    contx = context;
    marblePostfix = 0;
    originalOwner = "sunhwei";
    newOwner="shw100";
   return Promise.resolve();
}

module.exports.run = function() {

      marblePostfix++;
      return bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'transferMarble', marbleName: "marble"+marblePostfix ,owner:"sunhwei_new"}, 120);
   
}

module.exports.end = async function(results) {
    marblePostfix=0;
    for (let i=0; i<100; i++){

    }
    return Promise.resolve();
}

