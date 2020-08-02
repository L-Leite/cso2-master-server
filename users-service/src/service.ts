#!/usr/bin/env node

'use strict'

// add the src directory to the module search path
import 'app-module-path/register'

import { ServiceInstance } from 'serviceinstance'

const instance: ServiceInstance = new ServiceInstance()
instance.listen()

process
    .on('SIGINT', () => {
        void instance.stop()
    })
    .on('SIGTERM', () => {
        void instance.stop()
    })
