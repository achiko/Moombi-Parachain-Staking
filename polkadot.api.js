// Required imports
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main () {
    // Initialise the provider to connect to the local node
    const provider = new WsProvider('ws://127.0.0.1:9944');

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider });

    // Retrieve the chain & node information information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    console.log('--------------------------------');

    const collatorAccount = '0x940817a9b803fe30e06e06f5d7d2422f7ad06eb0';
    const collatorInfo = await api.query.parachainStaking.collatorState2(collatorAccount);
    console.log(collatorInfo.toHuman()["nominators"].length);
  
}

main().catch(console.error).finally(() => process.exit());