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
module.exports.init = function(blockchain, context, args) {

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


  //  if(!args.hasOwnProperty('money')) {
  //      return Promise.reject(new Error("simple.open - 'money' is missed in the arguments"));
  //  }

  //  initMoney = args['money'].toString();
    bc = blockchain;
    contx = context;
    marblePostfix = 1;
    originalOwner = "sunhwei";
    newOwner="shw100";
    return Promise.resolve();
}


module.exports.run = function() {
   
    marblePostfix++;
// ==== Query marbles ====
// peer chaincode query -C myc1 -n marbles -c '{"Args":["readMarble","marble1"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getMarblesByRange","marble1","marble3"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getHistoryForMarble","marble1"]}'

   // return bc.queryState(contx, 'marbles', 'v0', {"fcn":"readMarble", "args": ["marble3"]});
//   return  bc.queryState(contx, 'marbles', 'v0', {"fcn":"getMarblesByRange", "args": ["marble2","marbles3"]});
      return  bc.queryState(contx, 'marbles', 'v0', {"fcn":"getHistoryForMarble", "args": ["marble3"]});
// Rich Query (Only supported if CouchDB is used as state database):
//   peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarblesByOwner","tom"]}'
//   peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarbles","{\"selector\":{\"owner\":\"tom\"}}"]}'
     
//    return bc.queryState(contx, 'marbles', 'v0', {"fcn":"queryMarblesByOwner", "args": ["sunhwei_new"]});
    

//return bc.queryState(contx, 'marbles', 'v0', {"fcn":"queryMarbles", "args": ["{\"selector\":{\"owner\":\"sunhwei_new\"}}"]});      
}

module.exports.end = function(results) {
    return Promise.resolve();
}

module.exports.accounts = accounts;

