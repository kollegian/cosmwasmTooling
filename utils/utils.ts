import {DeliverTxResponse, GasPrice, SigningStargateClient} from "@cosmjs/stargate";
import {coins, DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {chain} from "../src/types";

export async function waitForSeconds(seconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  })
}

export function createDefaultSigningOptions(tokenName: string) {
  return GasPrice.fromString(`400${tokenName}`);
}

export async function getWalletAddress(wallet: DirectSecp256k1HdWallet) {
  const [account] = await wallet.getAccounts();
  return account.address;
}

export function getChainsForIbcTransfer(chainInfos: chain[]) {
  return chainInfos.filter(chain => chain.channels !== undefined);
}

export async function startIbcTransfer(
  client: SigningStargateClient,
  channelId: number,
  amount: string,
  wallet: DirectSecp256k1HdWallet,
  denom: string,
  recipient: DirectSecp256k1HdWallet): Promise<DeliverTxResponse>
{
    const amountParam = coins(amount, denom);
    const [recipientAccount] = await recipient.getAccounts();
    const sourcePort = "transfer";
    const sourceChannel = `channel-${channelId}`;
    const timeoutTimestamp = (Date.now() + 10 * 60 * 1000) * 1_000_000; // 10 minutes from now
    const [firstAccount] = await wallet.getAccounts();
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
    return await client.signAndBroadcast(firstAccount.address, [msgTransfer], "auto", "");
}