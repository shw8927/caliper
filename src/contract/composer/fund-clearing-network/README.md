# Fund Clearing Network

The Fund Clearing Network allows network participants to process inter-participant payments, thus replacing a traditional clearing house. We assume that participants within the network are Banking entities, that accumulate and submit one or more `TransferRequest` items to other participants. These transfer requests are placed into the business network, and when a `CreateBatch` transaction is invoked, all transfer requests for each `BankingParticipant` is accumulated into a series of net `BatchTransferRequest`. Each `BatchTransferRequest` details the required net `Settlement` between each `BankingParticipant` for the contained array of `TransferRequest` items, based on the `Currency` of the creditor bank.

# Network Flow
The Business Network flow is the following:
  - `BankingParticipant` submits a series of `TransferRequest` assets.
  - `CreateBatch` transaction is invoked, with a current `UsdExchangeRate` array.
  - `BankingParticipant` detects `BatchTransferRequest` assets that they are involved in and processes all referenced `TransferRequest` assets that they are creditors for (named under `toBank`). At this stage they would be updating internal systems to mark the payment in principal. Once all `TransferRequest` have been processed internally, the `BankingParticipant` executes a `MarkPreProcessTransferComplete` transaction, which will update the `TransferRequest` assets automatically, changing their state to `PRE_PROCESS_COMPLETE`.
  -  When all referenced `TransferRequest` assets are in the `PRE_PROCESS_COMPLETE` state, the `BatchTransferRequest` changes state to `READY_TO_SETTLE`.
  - `CompleteSettlement` transaction is invoked, with a current `UsdExchangeRate` array and thte identity of a `BatchTransferRequest`. This executes a fund transfer between the participating banks for the passed `BatchTransferRequest` and the state is moved to `PENDING_POST_PROCESS`.
  - Once settlement has occurred, each `BankingParticipant` would be updating their internal systems to move credit/debit payments from in principal, to complete. After their internal action, a `MarkPostProcessTransferComplete` would be submitted, which acts to update the state of all relevant `TransferRequest` assets to `COMPLETE`.
  - Once all `TransferRequest` assets are in the `COMPLETE` state, the parent `BatchTransferRequest` is marked as `COMPLETE`.

This business network defines:

**Participants**
`BankingParticipant`

**Assets**
`TransferRequest`, `BatchTransferRequest`

**Transactions**
`CreateBatch`, `MarkPreProcessTransferComplete`, `CompleteSettlement`, `MarkPostProcessTransferComplete`

## CreateBatch
The `CreateBatch` transaction submitted by a `BankingParticipant` participant will create a new `BatchTransferRequest`.

To test this Business Network Definition in the **Test** tab:

Create a minimum of two `BankingParticipant` participants:

```
{
  "$class": "org.clearing.BankingParticipant",
  "bankingId": "memberId:1",
  "bankingName": "bankingName1",
  "workingCurrency": "EURO",
  "fundBalance": 1000000
}
```

```
{
  "$class": "org.clearing.BankingParticipant",
  "bankingId": "memberId:2",
  "bankingName": "bankingName2",
  "workingCurrency": "USD",
  "fundBalance": 1000000
}
```

Create identities for both of these participants, as it is necessary to interact with the flow under two separate identities that are bound to the `BankingParticipant` participants involved in a `BatchTransaferRequest`.

Create a series of `TransferRequest` assets, referencing the created `BankingParticipant` participants in the `TransferRequest`

```
{
  "$class": "org.clearing.TransferRequest",
  "requestId": "1111",
  "details": {
    "$class": "org.clearing.Transfer",
    "currency": "EURO",
    "amount": 150,
    "fromAccount": "0987654321",
    "toAccount": "1234567890"
  },
  "fromBankState": "PENDING",
  "toBankState": "PENDING",
  "state": "PENDING",
  "fromBank": "resource:org.clearing.BankingParticipant#memberId:1",
  "toBank": "resource:org.clearing.BankingParticipant#memberId:2"
}
```


```
{
  "$class": "org.clearing.TransferRequest",
  "requestId": "2222",
  "details": {
    "$class": "org.clearing.Transfer",
    "currency": "USD",
    "amount": 75,
    "fromAccount": "0987654321",
    "toAccount": "1234567890"
  },
  "fromBankState": "PENDING",
  "toBankState": "PENDING",
  "state": "PENDING",
  "fromBank": "resource:org.clearing.BankingParticipant#memberId:2",
  "toBank": "resource:org.clearing.BankingParticipant#memberId:1"
}
```

Submit a `CreateBatch` transaction:

```
{
  "$class": "org.clearing.CreateBatch",
  "batchId": "batch1",
  "usdRates": [{"$class":"org.clearing.UsdExchangeRate", "to":"EURO","rate":0.75},
               {"$class":"org.clearing.UsdExchangeRate", "to":"STERLING","rate":1.75}]
}
```

The `CreateBatch` transaction will create a new `BatchTransferRequest` in the Asset Registry for each unique pairing of `BankingParticipant` participants that have pending `TransferRequest` assets. An event will be emitted for each `BatchTransferRequest` created.

Note that the new `BatchTransferRequest` asset contains a `batchId` field that has additional ":NN" appended to the batchID that was submitted in the transaction, where each N represents the banks participating in the particular `BatchTransferRequest`.


## MarkPreProcessTransferComplete

The `MarkPreProcessTransferComplete` transaction submitted by a user with an identity bound to a `BankingParticipant` participant will update all `TransferRequest` assets for the relevant `BankingParticipant` within a `BatchTransferRequest` to be in the sate `PRE_PROCESS_COMPLETE`. If all referenced `TransferRequest` assets are detected to be in the `PRE_PROCESS_COMPLETE` state, then the `BatchTransferRequest` is marked to be in the state `READY_TO_SETTLE`.

To test this Business Network Definition in the **Test** tab:

Create a BatchTransferRequest`, as detailed above.

Access the business network under an identity bound to a `BankingParticipant`. Submit a `MarkPreProcessTransferComplete` transaction, passing details of the `BatchTransferRequest` identifier.

```
{
  "$class": "org.clearing.MarkPreProcessTransferComplete",
  "batchId": "batch1:NN"
}
```

Repeat for both bound identities contained in the `BatchTransferRequest`.

## CompleteSettlement

The `CompleteSettlement` transaction submitted by a user with an identity bound to a `BankingParticipant` participant will perform a fund transafer between the named `BankingParticipant` participants from the passed `BatchTransferRequest` identifier, based on the most recent passed `UsdExchangeRates` array. Once funds have been transfered between `BankingParticipant` participants, the `BatchTransferRequest` will be marked in the `PENDING_POST_PROCESS` state.

To test this Business Network Definition in the **Test** tab:

Create a `BatchTransferRequest` and execute `MarkPreProcessTransferComplete` for both named participants, as detailed above.

Access the business network under an identity bound to a `BankingParticipant`. Submit a `CompleteSettlement` transaction, passing details of the `BatchTransferRequest` identifier and an array of current exchange rates to be used for currency adjustment.

```
{
  "$class": "org.clearing.CompleteSettlement",
  "batchId": "batch1:NN",
  "usdRates": [{"$class":"org.clearing.UsdExchangeRate", "to":"EURO","rate":0.75},
               {"$class":"org.clearing.UsdExchangeRate", "to":"STERLING","rate":1.75}]
}
```

## MarkPostProcessTransferComplete

The `MarkPostProcessTransferComplete` transaction submitted by a user with an identity bound to a `BankingParticipant` participant will update all `TransferRequest` assets the participant is named as a creditor for within a `BatchTransferRequest`, changing the state to `COMPLETE`. If all referenced `TransferRequest` assets contained in a `BatchTransferRequest` are detected to be in the `COMPLETE` state, then the `BatchTransferRequest` is changed to the state `COMPLETE`.

To test this Business Network Definition in the **Test** tab:

Access the business network under an identity bound to a `BankingParticipant`. Create a `BatchTransferRequest` and execute `MarkPreProcessTransferComplete` for both named participants, followed by a `CompleteSettlement` transaction, as detaied above.

Submit a `MarkPostProcessTransferComplete` transaction, passing details of the `BatchTransferRequest` identifier 

```
{
  "$class": "org.clearing.MarkPostProcessTransferComplete",
  "batchId": "batch1:NN"
}
```

Repeat for both bound identities.
