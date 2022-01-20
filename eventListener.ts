// Import the API
import { WsProvider } from "@polkadot/api";

const { ApiPromise } = require('@polkadot/api')

async function main() {
  // Create our API with a default connection to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944')
  const api = await ApiPromise.create({ provider })

  // Subscribe to system events via storage
  api.query.system.events((events: any) => {
    console.log(`\nReceived ${events.length} events:`)
    // Loop through the Vec<EventRecord>
    events.forEach((record: any) => {
      // Extract the phase, event and the event types
      const { event, phase } = record
      const types = event.typeDef

      // console.log('phase: ', phase)

      // Show what we are busy with
      console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`)
      // console.log(`\t\t${event.meta}`)

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data: any, index: any) => {
        console.log(`\t\t\t${types[index].type}: ${data.toString()}`)
      })

      console.log('--------------------------')
    })
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(-1)
})
