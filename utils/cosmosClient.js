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
exports.createSignerWallet = exports.createSigningClients = exports.generateWallet = exports.queryTokenBalance = exports.createCosmosSigningClient = exports.createWallet = exports.createCosmosClient = void 0;
const stargate_1 = require("@cosmjs/stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
const utils_1 = require("./utils");
function createCosmosClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const rpc = "http://127.0.0.1:37631";
        const client = yield stargate_1.StargateClient.connect(rpc);
        return client;
    });
}
exports.createCosmosClient = createCosmosClient;
function createWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        const mnemonic = 'apart ahead month tennis merge canvas possible cannon lady reward traffic city hamster monitor lesson nasty midnight sniff enough spatial rare multiply keep task';
        const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: "centauri", // Replace with the appropriate Bech32 prefix for your chain
        });
        return wallet;
    });
}
exports.createWallet = createWallet;
function createCosmosSigningClient(wallet, rpcEndpoint, tokenDenom) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultGasFee = (0, utils_1.createDefaultSigningOptions)(tokenDenom);
        const defaultSigningClientOptions = {
            broadcastPollIntervalMs: 300,
            broadcastTimeoutMs: 8000,
            gasPrice: defaultGasFee,
        };
        const client = yield stargate_1.SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, defaultSigningClientOptions);
        return client;
    });
}
exports.createCosmosSigningClient = createCosmosSigningClient;
function queryTokenBalance(client, token, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const [address] = yield wallet.getAccounts();
        console.log('Queried address is', address.address);
        const cliend = yield client.getChainId();
        console.log('Querying client is ', cliend);
        const tokenBalance = yield client.getBalance(address.address, token);
        console.log(`token balance of ${token} is `, tokenBalance);
        return tokenBalance.amount;
    });
}
exports.queryTokenBalance = queryTokenBalance;
function generateWallet(mnemonic, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: prefix, // Replace with the appropriate Bech32 prefix for your chain
        });
        return wallet;
    });
}
exports.generateWallet = generateWallet;
function createSigningClients(chainInfos, wallets) {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = new Map();
        yield Promise.all(chainInfos.map((chain) => __awaiter(this, void 0, void 0, function* () {
            const chainWallet = wallets.get(chain.chainName);
            const client = yield createCosmosSigningClient(chainWallet, chain.rpcEndpoint, chain.baseToken);
            chains.set(chain.chainName, client);
        })));
        return chains;
    });
}
exports.createSigningClients = createSigningClients;
function createSignerWallet(mnemonic, chainInfos) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallets = new Map;
        yield Promise.all(chainInfos.map((chain) => __awaiter(this, void 0, void 0, function* () {
            const wallet = yield generateWallet(mnemonic, chain.chainPrefix);
            wallets.set(chain.chainName, wallet);
        })));
        return wallets;
    });
}
exports.createSignerWallet = createSignerWallet;
