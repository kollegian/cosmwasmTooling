import {SigningStargateClient, SigningStargateClientOptions, StargateClient} from "@cosmjs/stargate";
import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {createDefaultSigningOptions} from "./utils";
import {chain} from "../src/types";


export async function createCosmosSigningClient(wallet: DirectSecp256k1HdWallet, rpcEndpoint: string, tokenDenom: string){
  const defaultGasFee = createDefaultSigningOptions(tokenDenom);
  const defaultSigningClientOptions = {
    broadcastPollIntervalMs: 300,
    broadcastTimeoutMs: 8_000,
    gasPrice: defaultGasFee,
  };
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, defaultSigningClientOptions);
  return client;
}

export async function queryTokenBalance(client: SigningStargateClient, token: string, wallet: DirectSecp256k1HdWallet){
  const [address] = await wallet.getAccounts();
  const tokenBalance = await client.getBalance(address.address, token);
  return tokenBalance.amount;
}

export async function generateWallet(mnemonic: string, prefix: string){
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: prefix, // Replace with the appropriate Bech32 prefix for your chain
  });
  return wallet;
}

export async function createSigningClients(chainInfos: chain[], wallets: Map<string, DirectSecp256k1HdWallet>)
  : Promise<Map<string, SigningStargateClient>>{
  const chains: Map<string, SigningStargateClient> = new Map();
  await Promise.all(chainInfos.map(async chain =>{
    const chainWallet = wallets.get(chain.chainName) as DirectSecp256k1HdWallet;
    const client = await createCosmosSigningClient(chainWallet, chain.rpcEndpoint, chain.baseToken);
    chains.set(chain.chainName, client);
  }));
  return chains;
}

export async function createSignerWallet(mnemonic: string, chainInfos: chain[])
  : Promise<Map<string, DirectSecp256k1HdWallet>>{
  const wallets = new Map<string, DirectSecp256k1HdWallet>;
  await Promise.all(chainInfos.map(async chain =>{
    const wallet = await generateWallet(mnemonic, chain.chainPrefix);
    wallets.set(chain.chainName, wallet);
  }));
  return wallets;
}