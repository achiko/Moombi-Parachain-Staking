# Hardhat-Moombeam Staking

- https://github.com/PureStake/moonbeam

- Moonbase Alpha PolkadotJS app
  https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwss.testnet.moonbeam.network#/explorer

## Compile & Build Docker image for M1 ARM proccessors

- Many Thanks @JoshOrndorff
- https://github.com/PureStake/moonbeam/issues/930#issuecomment-955189036

```bash
    docker run --rm --name moonbeam_development --network host moonbeam-0.13.2-arm --dev --rpc-methods unsafe --rpc-external --ws-external --pool-limit 100000 --ws-port 9944 --rpc-cors all
```

## Running Dev Node (working version):

```bash

    docker run --rm --name moonbeam_development -p 9944:9944 -p 9933:9933 \
        purestake/moonbeam:v0.20.1 \
            --dev --ws-external --rpc-external --sealing 1000
```

## A useful RPC call via CURL

```json

curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method":
    "chain_getBlock", "params":[]}' http://localhost:9933 | json_pp -json_opt pretty,canonical

curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method":
    "eth_chainId", "params":[]}' http://localhost:9933 | json_pp -json_opt pretty,canonical

```

# Staking & Documentation

https://docs.moonbeam.network/tokens/staking/stake/

```
Retrieving the List of Collators
Before starting to stake tokens, it is important to retrieve the list of collators available in the network. To do so:

Head to the "Developer" tab
Click on "Chain State"
Choose the pallet to interact with. In this case, it is the parachainStaking pallet
Choose the state to query. In this case, it is the selectedCandidates or candidatePool state
Send the state query by clicking on the "+" button
Each extrinsic provides a different response:

selectedCandidates — returns the current active set of collators, that is, the top 60 collators by total tokens staked (including nominations)
candidatePool — returns the current list of all the collators, including those that are not in the active set
```
