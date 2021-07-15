# Crypto.org Chain JS library

## Warning

Crypto.org Chain and this library is currently in the alpha development phase and subjects to changes. Before proceeding, please be aware of the following:

- This library is not production-ready, do not use in production systems.

- Do not transfer any ERC20 tokens to addresses generated by this sample code as it can cause loss of funds.

- Crypto.org is not liable for any potential damage, loss of data/files arising from the use of the library.

## 1. Quick Guide

### 1.0. Installing the library ⬇️

```bash
npm install @crypto-org-chain/chain-jslib
```

### 1.1. Working with private keys and key pairs 🔐

```javascript
// Imports
const sdk = require("@crypto-org-chain/chain-jslib");
const HDKey = sdk.HDKey;
const Secp256k1KeyPair = sdk.Secp256k1KeyPair;
const Bytes = sdk.utils.Bytes;


// Initializing the library configurations with TestNet config
const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });

// Generating a random mnemonic phrase
let randomPhrase = HDKey.generateMnemonic(12); // This returns a 12 words mnemonic phrase

// Import an HDKey from a previous mnemonic phrase
const importedHDKey = HDKey.fromMnemonic(
  "curtain maid fetch push pilot frozen speak motion island pigeon habit suffer gap purse royal hollow among orange pluck mutual eager cement void panther"
);

// Derive a private key from an HDKey at the specified path
const privateKey = importedHDKey.derivePrivKey("m/44'/1'/0'/0/0");

// Getting a keyPair from a private key
const keyPair = Secp256k1KeyPair.fromPrivKey(privateKey);

```

### 1.2. Generating an address 🔖

```javascript
// Initializing the library configurations with TestNet config
const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });

// Import private key from hex key value
let privKey = Bytes.fromHexString(
  "66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3"
);
// Get keyPair from the imported private key
const importedKeyPair = Secp256k1KeyPair.fromPrivKey(privKey);

// Generate address from the imported key pair
let address = new cro.Address(importedKeyPair).account();
console.log(address); // tcro1sxe3v6gka3u8j7d2xhl8rmfyjnmggqlh6e82hq
```

### 1.3. Build and Sign a transfer transaction ✅

```javascript
// Imports

const sdk = require("@crypto-org-chain/chain-jslib");
const HDKey = sdk.HDKey;
const Secp256k1KeyPair = sdk.Secp256k1KeyPair;
const Units = sdk.Units;
const Big = sdk.utils.Big;

// Initialize the library configurations with TestNet configs
const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });

const importedHDKey = HDKey.fromMnemonic(
  "curtain maid fetch push pilot frozen speak motion island pigeon habit suffer gap purse royal hollow among orange pluck mutual eager cement void panther"
);

// Derive a private key from an HDKey at the specified path
const privateKey = importedHDKey.derivePrivKey("m/44'/1'/0'/0/0");

// Getting a keyPair from a private key
const keyPair = Secp256k1KeyPair.fromPrivKey(privateKey);

// Init Raw transaction
const rawTx = new cro.RawTransaction();

const feeAmount = new cro.Coin("6500", Units.BASE);

// Custom properties set
rawTx.setMemo("Hello Test Memo");
rawTx.setGasLimit("280000");
rawTx.setFee(feeAmount);
rawTx.setTimeOutHeight(341910);

const msgSend = new cro.bank.MsgSend({
  fromAddress: "tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3",
  toAddress: "tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3",
  amount: new cro.Coin("1210", Units.BASE),
});

const signableTx = rawTx
  .appendMessage(msgSend)
  .addSigner({
    publicKey: keyPair.getPubKey(),
    accountNumber: new Big(41),
    accountSequence: new Big(13),
  })
  .toSignable();

const signedTx = signableTx
  .setSignature(0, keyPair.sign(signableTx.toSignDoc(0)))
  .toSigned();

console.log(signedTx.getHexEncoded());
// 0aa4010a8c010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126c0a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b6333122b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b63331a100a08626173657463726f120431323130120f48656c6c6f2054657374204d656d6f1896ef14126a0a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103c3d281a28592adce81bee3094f00eae26932cbc682fba239b90f47dac9fe703612040a020801180d12160a100a08626173657463726f12043635303010c08b111a40fe9b30f29bb9a83df3685f5bf8b7e6c34bae9ee8ba93115af4136289354c5bf947698ef3a3c0a1f6092ba7a2069616c436f4bcf6f3ecef11b92ad4d319ec0347

// Note that the result of signedTx.getHexEncoded() can be directly broadcasted to the network as a raw tx
```

### 1.4. Sending transactions 📨

The SDK uses cosmjs stargate client to send transactions. For more information, check
https://github.com/cosmos/cosmjs/tree/main/packages/stargate

```javascript
// Imports
const sdk = require("@crypto-org-chain/chain-jslib");
const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });
const client = await cro.CroClient.connect();
await client.broadcastTx(signedTx.encode().toUint8Array());
```

### 1.5. Query the chain ❓
The SDK uses cosmjs queryclient to query the blockchain. For more information, check
https://github.com/cosmos/cosmjs/tree/main/packages/stargate/src/queries

```javascript
// Imports
const sdk = require("@crypto-org-chain/chain-jslib");
const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });
const client = await cro.CroClient.connect();
const queryResult = await client.query().<module>.<operation>
// example client.query().bank.allBalances(<address>)
```

### 1.6. Transaction Decoding/Encoding support
Our SDK supports transaction decoding from hex-encoded strings.

```typescript
import { TxDecoder } from './txDecoder';
const txDecoder = new TxDecoder();
const decodedTx = txDecoder.fromHex('0a9b010a8c010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126c0a2b7463726f31667a63727a61336a3466323637376a667578756c6b6733337a36383532717371733868783530122b7463726f31667a63727a61336a3466323637376a667578756c6b6733337a363835327173717338687835301a100a08626173657463726f120431303030120a616d696e6f2074657374126b0a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a210223c9395d41013e6470c8d27da8b75850554faada3fe3e812660cbdf4534a85d712040a020801180112170a110a08626173657463726f1205313030303010a08d061a4031f4c489b98decb367972790747139c7706f54aafd9e5a3a5ada4f72c7b017646f1eb5cb1bdf518603d5d8991466a13c3f68844dcd9b168b5d4ca0cb5ea514bc');

//Prints decoded in Cosmos compatible JSON format
console.log(decodedTx.toCosmosJSON())

// Prints
// "{"tx":{"body":{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","amount":[{"denom":"basetcro","amount":"1000"}],"from_address":"tcro1fzcrza3j4f2677jfuxulkg33z6852qsqs8hx50","to_address":"tcro1fzcrza3j4f2677jfuxulkg33z6852qsqs8hx50"}],"memo":"amino test","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[{"public_key":{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AiPJOV1BAT5kcMjSfai3WFBVT6raP+PoEmYMvfRTSoXX"},"mode_info":{"single":{"mode":"SIGN_MODE_DIRECT"}},"sequence":"1"}],"fee":{"amount":[{"denom":"basetcro","amount":"10000"}],"gas_limit":"100000","payer":"","granter":""}},"signatures":["MfTEibmN7LNnlyeQdHE5x3BvVKr9nlo6WtpPcsewF2RvHrXLG99RhgPV2JkUZqE8P2iETc2bFotdTKDLXqUUvA=="]}}"

```

### 1.7. Offline Signing 
Our SDK supports offline signing for secure external transaction management.

#### Flow:
Machine 1(Online):
1. Build a `RawTransactionV2` instance. 
2. Export Cosmos compatible JSON by using `.toCosmosJSON()`. 
3. Export Signer(s) list using `.exportSignerAccounts()`. 

Machine 2 (Offline/Online):
1. Create a `SignableTransactionV2` instance from a stringified cosmos compatible JSON string.
2. You can import Signer(s) list using two methods:
   1. call `importSignerAccounts()` on the instance above **OR**
   2. (Advance usage) call `setSignerAccountNumberAtIndex()` to manually set AccountNumber at a specified index.
3. You can choose to export the signed hex encoded transaction and broadcast it manually

Eg:
```typescript
// import respective classes
// ....

/* Machine 1: */
const rawTx = new cro.v2.RawTransactionV2();
// .... Do rest operations here
const exportUnsignedCosmosJSON = rawTx.toCosmosJSON();
const exportSignerInfoToJSON = rawTx.exportSignerAccounts();

/* Machine 2: */
const signerAccountsOptional: SignerAccount[] = [{
    publicKey: <Bytes>;
    accountNumber: new Big(0);
    signMode: SIGN_MODE.DIRECT;
}];

const signableTx = new SignableTransaction({
                rawTxJSON: exportUnsignedCosmosJSON,
                network: <CroNetwork>,
                signerAccounts: signerAccountsOptional,
            });

/* `Import SignerAccounts` starts */

// METHOD 1: using importSignerAccounts()
signableTx.importSignerAccounts([
  // SignerAccount 1
  {
    publicKey: Bytes.fromHexString('hexString');
    accountNumber: new Big(0);
    signMode: SIGN_MODE.DIRECT;
  },
  // SignerAccount 2
  {
    publicKey: Bytes.fromUint8Array(<Uint8>);
    accountNumber: new Big(2);
    signMode: SIGN_MODE.DIRECT;
  }
]);

// METHOD 2 (For Advance Users): using setSignerAccountNumberAtIndex()
const signerInfoListINDEX: number = 1;
const newAccountNumber: Big = new Big(1);
signableTx.setSignerAccountNumberAtIndex(signerInfoListINDEX, newAccountNumber);

/* `Import SignerAccounts` ends */

// .... Do rest operations here on SignableTransaction

const signedTx = signableTx.toSigned();

console.log(signedTx.getHexEncoded());
// 0aa4010a8c010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126c0a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b6333122b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b63331a100a08626173657463726f120431323130120f48656c6c6f2054657374204d656d6f1896ef14126a0a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103c3d281a28592adce81bee3094f00eae26932cbc682fba239b90f47dac9fe703612040a020801180d12160a100a08626173657463726f12043635303010c08b111a40fe9b30f29bb9a83df3685f5bf8b7e6c34bae9ee8ba93115af4136289354c5bf947698ef3a3c0a1f6092ba7a2069616c436f4bcf6f3ecef11b92ad4d319ec0347

// Note that the result of signedTx.getHexEncoded() can be directly broadcasted to the network as a raw tx

```


### 1.8. Create a message from Cosmos compatible JSON
All **Cosmos message** types supported on our SDK can be instantiated using the function `.fromCosmosMsgJSON()` on respective classes. You need to pass a valid Msg `JSON` string and a `network` instance.
Eg.
```typescript
const msgSendJson ='{ "@type": "/cosmos.bank.v1beta1.MsgSend", "amount": [{ "denom": "basetcro", "amount":   "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            
            const msgSend = cro.v2.bank.MsgSendV2.fromCosmosMsgJSON(msgSendJson, CroNetwork.Testnet);
            // `msgSend` is a valid instance of `MsgSendV2` and can be used for Transaction building


const msgFundCommunityPoolJson =
                '{"@type":"/cosmos.distribution.v1beta1.MsgFundCommunityPool","amount":[{ "denom": "basetcro", "amount": "3478499933290496" }],"depositor":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';

            const msgFundCommPool = cro.v2.distribution.MsgFundCommunityPoolV2.fromCosmosMsgJSON(msgFundCommunityPoolJson, CroNetwork.Testnet);
            // `msgFundCommPool`is a valid instance of `MsgFundCommunityPoolV2` and can be used for Transaction building
            
```  

## 2. Introducing `V2` message types
Our SDK has introduced `V2` message types in order to support:
- Custom `denom`
- Multiple `amount` in several Cosmos Message types
- Multiple `fee` amount in `SignerInfo` 

You can use the `v2` property on the `CroSDK` instance like in the example below:  

```typescript
// imports here

const cro = CroSDK({ network: sdk.CroNetwork.Testnet });

// v2 methods below
const coin1 = new cro.Coin('88888888', Units.BASE);
const coin2 = new cro.Coin('99999999', Units.BASE);
const msgSendV2 = new cro.v2.bank.MsgSendV2({
          fromAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
          toAddress: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
          amount: [coin1, coin2],
        });
```

### 2.1 List of new `V2` methods

* New classes for external transaction management:
  - `RawTransactionV2`
    - `.toCosmosJSON()` : Get a Cosmos-sdk compatible JSON string
    - `.exportSignerAccounts()` : Exports a human readable JSON of `SignerAccount`
    - `appendFeeAmount(...)` : Add multiple fee amount to `SignerInfo` list
  - `CoinV2` : Supports custom denom support
  - `SignableTransactionV2` : Load your Cosmos Tx JSON for transaction management.
  
Please note new message types may be added under the `CroSDK` instance.

## 3. Cosmos Protobuf Definitions

### Generate Cosmos Protobuf Definitions in JavaScript

1. Download Cosmos proto definitions folder

    ```bash
    npm run get-proto
    ```

2. Generate definitions files in JavaScript

    ```bash
    npm run define-proto
    ```

### Update Supported Modules

1. To support more Cosmos modules, edit `lib/src/cosmos/v1beta1/scripts/predefine-proto.sh` and append the lines

    ```
    "$COSMOS_PROTO_DIR/bank/v1beta1/bank.proto" \
    "$COSMOS_PROTO_DIR/bank/v1beta1/tx.proto" \
    ```
    In this example it is adding `bank` module support, replace the paths with the modules and its protbuf files accordingly.

2. edit `lib/src/cosmos/v1beta1/types/typeurls.ts` to add the protobuf type URLs to JS definitions mapping

## 3. API Documentation

The library API documentation can be generated by running

```bash
npm run docs:build
```

The resulting generated documentation will be created in the `docs/dist` directory

## 4. License
[Apache 2.0](./LICENSE)
