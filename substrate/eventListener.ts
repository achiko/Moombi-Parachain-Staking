// Import the API
import { WsProvider } from '@polkadot/api'

const { ApiPromise } = require('@polkadot/api')

async function main() {
  // Create our API with a default connection to the local node
  // const provider = new WsProvider('ws://127.0.0.1:9944')
  //const provider = new WsProvider('wss://moonbeam.api.onfinality.io/ws?apikey=ca6eb048-061e-4061-a074-0277e5e835bd')

  const provider = new WsProvider('ws://88.218.226.104:8020')
  const api = await ApiPromise.create({ provider })

  const startBlock = 522651
  const endBlock = startBlock - 10000
  for (let i = startBlock; i >= endBlock; i--) {
    // let blockNumber = 574570
    var hash = await api.rpc.chain.getBlockHash(i)
    var events = await api.query.system.events.at(hash)
    // console.log(`\n #${i} Received ${events.length} events:`)

    // loop through the Vec<EventRecord>
    events.forEach((record: any) => {
      // extract the phase, event and the event types
      const { event, phase } = record
      const types = event.typeDef

      // show what we are busy with
      // console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`)
      // console.log(`Meta name :  \t\t${event.meta.documentation}`)
      // console.log(`\t ${event.method} `)

      if (event.method === 'DelegationRevocationScheduled' || event.method === 'DelegationDecreaseScheduled') {
        console.log('EVENT NAME : ', event.method)

        let _data = event.data.toHuman()
        // console.log(event.data.toHuman())
        if (_data[2] === '0x13a61daC75e2F66721dcaEdA726be1E636928800') {
          console.log(_data)
        }
        // event.data.forEach((data: any, index: any) => {
        //   console.log(data.toHuman())
        //   // if (data.toString() === '0xD25f5cBb15E2D5ff790c93464C9DA95693684065') {
        //   //     console.log(`\t\t\t${types[index].type}: ${data.toString()}`)
        //   // }
        // })
        console.log('------------------------------------------------------------')
      }
    })
  }

  console.log('Finished ...')
  process.exit(0)

  // Subscribe to system events via storage
  // api.query.system.events((events: any) => {
  //   console.log(`\nReceived ${events.length} events:`)
  //   // Loop through the Vec<EventRecord>
  //   events.forEach((record: any) => {
  //     // Extract the phase, event and the event types
  //     const { event, phase } = record
  //     const types = event.typeDef
  //
  //     // console.log('phase: ', phase)
  //
  //     // Show what we are busy with
  //     console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`)
  //     // console.log(`\t\t${event.meta}`)
  //
  //     // Loop through each of the parameters, displaying the type and data
  //     event.data.forEach((data: any, index: any) => {
  //       console.log(`\t\t\t${types[index].type}: ${data.toString()}`)
  //     })
  //
  //     console.log('--------------------------')
  //   })
  // })
}

main().catch((error) => {
  console.error(error)
  process.exit(-1)
})
