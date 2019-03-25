#!/usr/bin/env node

'use strict'

// add the src directory to the module search path
import 'app-module-path/register'

import program from 'commander'

import { getNetIntf, getOrAskNetIntf, INetIntf } from 'interfacepicker'
import { ServerInstance } from 'serverinstance'

program
  .version('0.8.13')
  .option('-i, --ip-address [ip]', 'The IP address to be used by the server (don\'t use --interface with this)', null)
  .option('-I, --interface [intf]', 'The interface to be used by the server (don\'t use --ip-address with this)', null)
  .option('-p, --port-master [port]', 'The server\'s (TCP) port', 30001)
  .option('-P, --port-holepunch [port]', 'The server\'s holepunch (UDP) port', 30002)
  .option('-l, --log-packets', 'Log the incoming and outgoing packets')
  .parse(process.argv)

/**
 * the entry point of the server
 */
async function startServer() {
  let desiredIp: string = null

  // fail if the user inputs both an ip address and an interface
  if (program.ipAddress && program.interface) {
    console.error('You many only specify --ip-address OR --interface, not both.\n\n')
    program.outputHelp()
    process.exit(2)
  }

  if (program.ipAddress) {
    // prefer the ip address argument over asking the user for it
    // if it's wrong, the user will get an error when binding it later
    // should that be validated in here?
    desiredIp = program.ipAddress
  } else if (program.interface) {
    // try to find the user's desired interface and use its ipv4 address
    const intf: INetIntf = getNetIntf(program.interface)

    // fail if we couldn't find it
    if (intf == null) {
      console.error('Could not find the user\'s desired interface...\n\n')
      program.outputHelp()
      process.exit(1)
    }

    desiredIp = intf.net.address
  } else {
    const intf: INetIntf = await getOrAskNetIntf()

    // exit the program if the user failed to input an interface
    if (intf == null) {
      console.error('User failed to input a valid interface...\n\n')
      program.outputHelp()
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
