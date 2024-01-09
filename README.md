## Description

This project includes a set of tools for testing and verifying Inter-Blockchain Communication (IBC) in Cosmos chains. It provides functionality to check block production and IBC connections between chains.

## Features

- **Block Production Check:** Ensures that specified Cosmos chains are producing blocks.
- **IBC Connection Check:** Verifies IBC connections by initiating token transfers between chains and confirming balance changes.

## Installation

```bash
git clone [Your Repository URL]
cd [Your Repository Directory]
npm install
```

## Usage
- **Check Cosmos Chains Block Production**

    ~~~
    const { checkCosmosChainsBlockProduction } = require('[Your Main File]');
    // Optional: Provide a custom configuration
    checkCosmosChainsBlockProduction(customConfig).then(() => {
    console.log('Block production check complete.');
    }).catch(err => {
    console.error('Error checking block production:', err);
    });
    ~~~
- **Check Ibc Connection Activation**
  ~~~
  const { checkIbcConnections } = require('[Your Main File]');
  // Optional: Provide a custom configuration
  checkIbcConnections(customConfig).then(() => {
  console.log('IBC connection check complete.');
  }).catch(err => {
  console.error('Error checking IBC connections:', err);
  });
  ~~~
## Configuration 
An example configuration is as follows: 
~~~
{
  "mnemonic": "<mnemonic for cosmos wallet>",
  "chainInfos": {
    "centauri": {
      "chainName": "centauri",
      "chainPrefix": "centauri",
      "rpcEndpoint": "http://127.0.0.1:26657",
      "baseToken": "ppica",
      "channels": {
        "osmosis": {
          "channelId": 1,
          "token": "ibc/3262D378E1636BE287EC355990D229DCEB828F0C60ED5049729575E235C60E8B" // osmo on centauri
        },
        "neutron": {
          "channelId": 1,
          "token": "ibc/1762D378E1636BE287EC355990D229DCEB828F0C60ED5049729575E235C60E633" // untrn on centauri    
      }
    },
    "osmosis": {
      "chainName": "osmosis",
      "chainPrefix": "osmo",
      "rpcEndpoint": "http://127.0.0.1:38093",
      "baseToken": "uosmo",
      "channels": {
        "centauri": {
          "channelId": 0,
          "token": "ibc/3262D378E1636BE287EC355990D229DCEB828F0C60ED5049729575E235C60E8B"  // ppica on osmosis
        }
      }
    }
  }
}
~~~
