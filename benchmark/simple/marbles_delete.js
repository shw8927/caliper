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
    bc =blockchain;
    contx = context;
    marblePostfix = 0;
   return Promise.resolve();
}

module.exports.run = function() {

//    let tempId= (marblePostfix++)%100;
      marblePostfix++;
    return   bc.invokeSmartContract(contx, 'marbles', 'v0', {verb: 'delete', marbleName: "marble"+marblePostfix }, 120);
   
}

module.exports.end = async function(results) {
    marblePostfix=0;
    for (let i=0; i<100; i++){
        marblePostfix++;

    }
    return Promise.resolve();
}

