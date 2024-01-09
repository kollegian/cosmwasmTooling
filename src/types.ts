export interface chain {
  chainName: string;
  chainPrefix: string,
  rpcEndpoint: string,
  baseToken: string,
  channels?: {
    [toChannel: string]: {
      channelId: number,
      token: string
    }
  }
}

export interface chainConfigs {
  mnemonic: string,
  chainInfos: {
    [chainName: string]: chain,
  }
}