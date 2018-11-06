#!/usr/bin/env node

'use strict'

// add the src path to the module search path
import 'app-module-path/register'

import { Uint64LE } from 'int64-buffer'
import { ServerInstance } from 'serverinstance'

// the port that the server will listen to
const serverPort = 30001
// the port used to holepunch the client's udp ports
const udpHolePunchPort = 30002

const masterServer: ServerInstance = new ServerInstance({
  holepunchPort: udpHolePunchPort,
  masterPort: serverPort,
})

masterServer.listen()
