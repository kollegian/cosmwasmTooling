import {createSignerWallet, createSigningClients, queryTokenBalance} from "../utils/cosmosClient";
import {getChainsForIbcTransfer, startIbcTransfer, waitForSeconds} from "../utils/utils";
import {chain, chainConfigs} from "./types";
import * as assert from "assert";
import defaultTestConfig from "./testConfig.json";

/**
 * Checks block production on Cosmos chains.
 *
 * This function verifies if the specified Cosmos chains are producing blocks. It waits for each chain
 * to produce at least three blocks. If a chain does not produce three blocks within a minute, the function
 * throws an error.
 *
 * @param {chainConfigs} [testConfig=defaultTestConfig] - The configuration object for the test,
 *                                                        including chain information and mnemonic.
 *                                                        If not provided, defaultTestConfig is used.
 * @returns {Promise<void>} - A promise that resolves when the block production check is complete.
 * @throws {Error} If a chain does not produce 3 blocks within 60 seconds.
 *
 * @example
 * await checkCosmosChainsBlockProduction(myTestConfig);
 */
export async function checkCosmosChainsBlockProduction(testConfig?: chainConfigs): Promise<void> {
  if(!testConfig){
    testConfig = defaultTestConfig;
  }
  const chainInfos = Object.values(testConfig.chainInfos) as chain[];
  const wallets = await createSignerWallet(testConfig.mnemonic, chainInfos);
  const signingClients = await createSigningClients(chainInfos, wallets);
  await Promise.all(Array.from(signingClients.entries()).map(async ([chainName, signingClient]) => {
    let currentBlock = await signingClient.getBlock();
    let startBlock = currentBlock.header.height;
    let retries = 0;
    while (startBlock + 3 > currentBlock.header.height) {
      currentBlock = await signingClient.getBlock();
      await waitForSeconds(1);
      console.log(`Waiting for ${chainName} to produce 3 blocks`);
      retries++;
      if (retries > 60) {
        throw new Error(`${chainName} didnt produce blocks for 1 minute`);
      }
    }
    console.log(`${chainName} started successfully. Produced 3 blocks successfully`);
  }));
}

/**
 * Checks IBC (Inter-Blockchain Communication) connections between chains.
 *
 * This function verifies IBC connections by initiating a token transfer between chains and
 * confirming the change in balance. It iterates over all chains capable of IBC transfers,
 * initiates a transfer from each chain to its connected chains, and checks if the balance
 * on the recipient chain changes within a specified timeout period.
 *
 * @param {chainConfigs} [testConfig=defaultTestConfig] - The configuration object for the test,
 *                                                        including chain information and mnemonic.
 *                                                        If not provided, defaultTestConfig is used.
 * @returns {Promise<void>} - A promise that resolves when the IBC connection check is complete.
 * @throws {AssertionError} If the balance on the recipient chain does not change as expected.
 *
 * @example
 * await checkIbcConnections(myTestConfig);
 */
export async function checkIbcConnections(testConfig?: chainConfigs) {
  if(!testConfig){
    testConfig = defaultTestConfig;
  }
  const chainInfos = Object.values(testConfig.chainInfos) as chain[];
  const wallets = await createSignerWallet(testConfig.mnemonic, chainInfos);
  const signingClients = await createSigningClients(chainInfos, wallets);
  const ibcAblechains = getChainsForIbcTransfer(chainInfos);
  const transferAmount = "100000000000";
  const timeout = 40;
  await Promise.all(ibcAblechains.map(async chainInfo => {
    if (chainInfo.channels) {
      const toChain = Object.entries(chainInfo.channels);
      await Promise.all(toChain.map(async ([toChain, channelInfo]) => {
        const fromWallet = wallets.get(chainInfo.chainName)!;
        const toWallet = wallets.get(toChain)!;
        const fromSigningClient = signingClients.get(chainInfo.chainName)!;
        const toSigningClient = signingClients.get(toChain)!;
        const preBalance = await queryTokenBalance(toSigningClient, channelInfo.token, toWallet);
        await startIbcTransfer(fromSigningClient, channelInfo.channelId, transferAmount, fromWallet, chainInfo.baseToken, toWallet);
        let afterBalance = await queryTokenBalance(toSigningClient, channelInfo.token, toWallet);
        let retries = 0;
        while (afterBalance === preBalance && retries < timeout) {
          await waitForSeconds(3);
          afterBalance = await queryTokenBalance(toSigningClient, channelInfo.token, toWallet);
          retries++;
          if (retries === timeout) {
            console.log(`${chainInfo.chainName} to ${toChain} transfers didnt go through after two minutes`);
          }
        }
        assert.notEqual(afterBalance, preBalance, `Balance not changed on ${toChain} after waiting for two minutes`);
      }));
    }
  }));
}
