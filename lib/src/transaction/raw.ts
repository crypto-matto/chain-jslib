import ow from 'ow';
import Big from 'big.js';

import { cosmos } from '../cosmos/v1beta1/codec';
import { Msg, owMsg } from '../cosmos/v1beta1/types/msg';
import { AuthInfo, TxBody } from '../cosmos/v1beta1/types/tx';
import { owRawTransactionSigner } from './ow.types';
import { Bytes } from '../utils/bytes/bytes';
import { isValidSepc256k1PublicKey } from '../utils/secp256k1';
import { isBigInteger } from '../utils/big';
import { Network } from '../network/network';
import { SignerAccount } from './types';
import { SignableTransaction } from './signable';
import { cloneDeep } from '../utils/clone';
import { Message } from './msg/Message';
import { InitConfigurations } from '../core/cro';

export const rawTransaction = function (config: InitConfigurations) {
    return class RawTransaction {
        public readonly txBody: TxBody = {
            typeUrl: '/cosmos.tx.v1beta1.TxBody',
            value: {
                messages: [],
            },
        };

        public readonly authInfo: AuthInfo = {
            signerInfos: [],
            fee: {
                gasLimit: new Big(200000),
            },
        };

        public readonly network: Network;

        public readonly signerAccounts: SignerAccount[] = [];

        /**
         * Constructor to create a new Transaction
         * @returns {RawTransaction}
         * @throws {Error} when options is invalid
         */
        public constructor() {
            this.network = config.network;
        }

        /**
         * Add Cosmos message to transaction. The message orders will follow the add order.
         * @param {Msg} message one of the supported Cosmos message
         * @returns {RawTransaction}
         * @throws {Error} when message is invalid
         * @memberof Transaction
         */
        public addMessage(message: Msg): RawTransaction {
            ow(message, 'message', owMsg());

            this.txBody.value.messages.push(message);

            return this;
        }

        /**
         * Append Cosmos MsgSend to transaction
         * @param {Message} message one of the supported Cosmos message
         * @returns {RawTransaction}
         * @throws {Error} when message is invalid
         * @memberof Transaction
         */
        public appendMessage(message: Message): RawTransaction {
            return this.addMessage(message.toRawMsg());
        }

        /**
         * Add a signer to the transaction. The signer orders will follow the add order.
         * @param {TransactionSigner} signer
         * @param {Bytes} signer.publicKey signer public key
         * @param {Big} signer.accountNumber  account number of the signer address
         * @param {Big} signer.accountSequence account sequence of the signer address
         * @returns {RawTransaction}
         * @throws {Error} when argument is invalid
         * @memberof Transaction
         */
        public addSigner(signer: TransactionSigner): RawTransaction {
            ow(signer, 'signer', owRawTransactionSigner);

            const publicKeyResult = isValidSepc256k1PublicKey(signer.publicKey);
            if (!publicKeyResult.ok) {
                throw new TypeError(publicKeyResult.err('signer'));
            }

            if (!isBigInteger(signer.accountNumber) && signer.accountNumber.gte(0)) {
                throw new TypeError(
                    `Expected accountNumber to be of positive integer, got \`${signer.accountNumber}\``,
                );
            }
            if (!isBigInteger(signer.accountSequence) && signer.accountSequence.gte(0)) {
                throw new TypeError(
                    `Expected accountNumber to be of positive integer, got \`${signer.accountNumber}\``,
                );
            }

            this.authInfo.signerInfos.push({
                publicKey: signer.publicKey,
                // TODO: support multisig
                modeInfo: {
                    single: {
                        mode: cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
                    },
                },
                sequence: signer.accountSequence,
            });
            this.signerAccounts.push({
                publicKey: signer.publicKey,
                accountNumber: signer.accountNumber,
            });

            return this;
        }

        /**
         * Returns signable transaction
         * @returns {SignableTransaction}
         * @throws {Error} when the transaction is incompleted
         * @memberof RawTransaction
         */
        public toSignable(): SignableTransaction {
            if (this.txBody.value.messages.length === 0) {
                throw new Error('Expected message in transaction, got none');
            }
            if (this.authInfo.signerInfos.length === 0) {
                throw new Error('Expected signer in transaction, got none');
            }
            return new SignableTransaction({
                txBody: cloneDeep(this.txBody),
                authInfo: cloneDeep(this.authInfo),
                network: cloneDeep(this.network),
                signerAccounts: cloneDeep(this.signerAccounts),
            });
        }

        /**
         * Returns TxBody
         * @returns {TxBody}
         * @memberof Transaction
         */
        public getTxBody(): Readonly<TxBody> {
            return this.txBody;
        }

        /**
         * Returns AuthInfo
         * @returns {AuthInfo}
         * @memberof Transaction
         */
        public getAuthInfo(): Readonly<AuthInfo> {
            return this.authInfo;
        }

        /**
         * Return network of the transaction
         * @returns {string}
         * @memberof Transaction
         */
        public getNetwork(): Readonly<Network> {
            return this.network;
        }

        /**
         * Return signer account numbers array
         * @returns {SignerAccount[]}
         * @memberof Transaction
         */
        public getSignerAccounts(): Readonly<SignerAccount[]> {
            return this.signerAccounts;
        }

        // TODO: Coin needs to support network
        // public setFee(coin: Coin): Transaction {}

        // TODO:
        // public setGasLimit()
    };
};

export type TransactionOptions = {
    network: Network;
};

export type TransactionSigner = {
    publicKey: Bytes;
    accountNumber: Big;
    accountSequence: Big;
};