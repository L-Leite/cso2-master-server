#!/usr/bin/env node

'use strict'

// add the src directory to the module search path
import 'app-module-path/register'

import program from 'commander'

import { getOrAskNetIntf, INetIntf } from 'interfacepicker'
import { ServerInstance } from 'serverinstance'

program
  .version('0.5.0')
  .option('-i, --ip-address [ip]', 'The IP address to be used by the server', null)
  .option('-p, --port-master [port]', 'The server\'s (TCP) port', 30001)
  .option('-P, --port-holepunch [port]', 'The server\'s holepunch (UDP) port', 30002)
  .option('-l, --log-packets', 'Log the incoming and outgoing packets')
  .parse(process.argv)

async function startServer() {
  let desiredIp: string = null

  // prefer the ip address argument over asking the user for it
  if (program.ipAddress) {
    desiredIp = program.ipAddress
  } else {
    const intf: INetIntf = await getOrAskNetIntf()

    // exit the program if the user failed to input an interface
    if (intf == null) {
      program.outputHelp((str: string) => {
        console.error(str)
        return str
      })
      process.exit(1)
    }

    desiredIp = intf.net.address
  }

  const masterServer: ServerInstance = new ServerInstance({
    hostname: desiredIp,
    portHolepunch: program.portHolepunch,
    portMaster: program.portMaster,
    shouldLogPackets: program.logPackets,
  })

  masterServer.listen()
}

startServer()
