#!/usr/bin/env node

'use strict'

// add the src path to the module search path
import 'app-module-path/register'

import program from 'commander'

import { ServerInstance } from 'serverinstance'

program
  .version('0.2.0')
  .option('-i, --ip-address <ip>', 'The IP address to be used by the server')
  .option('-p, --port-master [port]', 'The server\'s (TCP) port', 30001)
  .option('-P, --port-holepunch [port]', 'The server\'s holepunch (UDP) port', 30002)
  .parse(process.argv)

// stop running if the user didn't pass the IP address
if (program.ipAddress == null) {
  console.error('No IP address given!')
  program.outputHelp((str: string) => {
    console.error(str)
    return str
  })
  process.exit(1)
}

console.log('Using command line arguments --ip-address as ' + program.ipAddress + '\n' +
  '--port-master as ' + program.portMaster + '\n' +
  '--port-holepunch as ' + program.portHolepunch)

const masterServer: ServerInstance = new ServerInstance({
  hostname: program.ipAddress,
  portHolepunch: program.portHolepunch,
  portMaster: program.portMaster,
})

masterServer.listen()
