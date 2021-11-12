# Hardhat-Moombeam Staking

Running Dev Node :

docker run --rm --name moonbeam_development --network host purestake/moonbeam:v0.13.2 --dev --rpc-methods unsafe --rpc-external --ws-external --pool-limit 100000 --ws-port 9944 --rpc-cors all

```
    docker run --network="host" -d -v "/var/lib/alphanet-data:/data" \
    -u $(id -u root):$(id -g root) \
    purestake/moonbeam:v0.14.2 \
    --base-path=/data \
    --chain alphanet \
    --name="thenextblock-1" \
    --execution wasm \
    --wasm-execution compiled \
    --pruning archive \
    --state-cache-size 1 \
    -- \
    --pruning archive \
    --name="thenextblock.com-1 (Embedded Relay)"

```
