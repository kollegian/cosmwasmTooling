"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIbcTransfer = exports.getChainsForIbcTransfer = exports.getWalletAddress = exports.createDefaultSigningOptions = exports.waitForSeconds = void 0;
const stargate_1 = require("@cosmjs/stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
function waitForSeconds(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    });
}
exports.waitForSeconds = waitForSeconds;
function createDefaultSigningOptions(tokenName) {
    return stargate_1.GasPrice.fromString(`400${tokenName}`);
}
exports.createDefaultSigningOptions = createDefaultSigningOptions;
function getWalletAddress(wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const [account] = yield wallet.getAccounts();
        return account.address;
    });
}
exports.getWalletAddress = getWalletAddress;
function getChainsForIbcTransfer(chainInfos) {
    return chainInfos.filter(chain => chain.channels !== undefined);
}
exports.getChainsForIbcTransfer = getChainsForIbcTransfer;
function startIbcTransfer(client, channelId, amount, wallet, denom, recipient) {
    return __awaiter(this, void 0, void 0, function* () {
        const amountParam = (0, proto_signing_1.coins)(amount, denom);
        const [recipientAccount] = yield recipient.getAccounts();
        const sourcePort = "transfer";
        const sourceChannel = `channel-${channelId}`;
        const timeoutTimestamp = (Date.now() + 10 * 60 * 1000) * 1000000; // 10 minutes from now
        const [firstAccount] = yield wallet.getAccounts();
        const msgTransfer = {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: {
                sourcePort,
                sourceChannel,
                sender: firstAccount.address,
                receiver: recipientAccount.address,
                token: amountParam[0],
                timeoutTimestamp
            },
        };
        return yield client.signAndBroadcast(firstAccount.address, [msgTransfer], "auto", "");
    });
}
exports.startIbcTransfer = startIbcTransfer;
