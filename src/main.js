"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIbcConnections = exports.checkCosmosChainsBlockProduction = void 0;
const cosmosClient_1 = require("../utils/cosmosClient");
const utils_1 = require("../utils/utils");
const assert = __importStar(require("assert"));
const testConfig_json_1 = __importDefault(require("./testConfig.json"));
/**
 *
 * @param testConfig
 */
function checkCosmosChainsBlockProduction(testConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!testConfig) {
            testConfig = testConfig_json_1.default;
        }
        const chainInfos = Object.values(testConfig.chainInfos);
        const wallets = yield (0, cosmosClient_1.createSignerWallet)(testConfig.mnemonic, chainInfos);
        const signingClients = yield (0, cosmosClient_1.createSigningClients)(chainInfos, wallets);
        yield Promise.all(Array.from(signingClients.entries()).map(([chainName, signingClient]) => __awaiter(this, void 0, void 0, function* () {
            let currentBlock = yield signingClient.getBlock();
            let startBlock = currentBlock.header.height;
            let retries = 0;
            while (startBlock + 5 > currentBlock.header.height) {
                currentBlock = yield signingClient.getBlock();
                yield (0, utils_1.waitForSeconds)(1);
                console.log(`Waiting for ${chainName} to produce 5 blocks`);
                retries++;
                if (retries > 60) {
                    throw new Error(`${chainName} didnt produce blocks for 1 minute`);
                }
            }
            console.log(`${chainName} started successfully. Produced 5 blocks successfully`);
        })));
    });
}
exports.checkCosmosChainsBlockProduction = checkCosmosChainsBlockProduction;
function checkIbcConnections(testConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!testConfig) {
            testConfig = testConfig_json_1.default;
        }
        const chainInfos = Object.values(testConfig.chainInfos);
        const wallets = yield (0, cosmosClient_1.createSignerWallet)(testConfig.mnemonic, chainInfos);
        const signingClients = yield (0, cosmosClient_1.createSigningClients)(chainInfos, wallets);
        const ibcAblechains = (0, utils_1.getChainsForIbcTransfer)(chainInfos);
        const transferAmount = "100000000000";
        const timeout = 40;
        yield Promise.all(ibcAblechains.map((chainInfo) => __awaiter(this, void 0, void 0, function* () {
            if (chainInfo.channels) {
                const toChain = Object.entries(chainInfo.channels);
                yield Promise.all(toChain.map(([toChain, channelInfo]) => __awaiter(this, void 0, void 0, function* () {
                    const fromWallet = wallets.get(chainInfo.chainName);
                    const toWallet = wallets.get(toChain);
                    const fromSigningClient = signingClients.get(chainInfo.chainName);
                    const toSigningClient = signingClients.get(toChain);
                    const preBalance = yield (0, cosmosClient_1.queryTokenBalance)(toSigningClient, channelInfo.token, toWallet);
                    yield (0, utils_1.startIbcTransfer)(fromSigningClient, channelInfo.channelId, transferAmount, fromWallet, chainInfo.baseToken, toWallet);
                    let afterBalance = yield (0, cosmosClient_1.queryTokenBalance)(toSigningClient, channelInfo.token, toWallet);
                    let retries = 0;
                    while (afterBalance === preBalance && retries < timeout) {
                        yield (0, utils_1.waitForSeconds)(3);
                        afterBalance = yield (0, cosmosClient_1.queryTokenBalance)(toSigningClient, channelInfo.token, toWallet);
                        retries++;
                        if (retries === timeout) {
                            console.log(`${chainInfo.chainName} to ${toChain} transfers didnt go through after two minutes`);
                        }
                    }
                    assert.notEqual(afterBalance, preBalance, `Balance not changed on ${toChain} after waiting for two minutes`);
                })));
            }
        })));
    });
}
exports.checkIbcConnections = checkIbcConnections;
