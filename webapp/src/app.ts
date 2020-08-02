#!/usr/bin/env node

'use strict'

// add the src directory to the module search path
import 'app-module-path/register'

import { UserSvcPing } from 'authorities'
import { LogInstance } from 'log/loginstance'
import { ServiceInstance } from 'serviceinstance'

/**
 * check if the required environment variables are set on start
 * throws an error if one is missing
 */
function validateEnvVars(): void {
    if (process.env.WEBAPP_PORT == null) {
        throw new Error('WEBAPP_PORT environment variable is not set.')
    }

    if (process.env.USERSERVICE_HOST == null) {
        throw new Error('USERSERVICE_HOST environment variable is not set.')
    }

    if (process.env.USERSERVICE_PORT == null) {
        throw new Error('USERSERVICE_PORT environment variable is not set.')
    }
}

async function checkServices(): Promise<boolean> {
    await Promise.all([UserSvcPing.checkNow()])

    return UserSvcPing.isAlive()
}

let instance: ServiceInstance = null

/**
 * start a service instance
 */
async function EntryPoint(): Promise<boolean> {
    validateEnvVars()

    if (await checkServices()) {
        LogInstance.warn('Connected to user and inventory services')
        LogInstance.warn('User service is at ' + UserSvcPing.getHost())
        instance = new ServiceInstance()
        await instance.listen()
        return true
    }

    LogInstance.warn(
        'Could not connect to the services, waiting 5 seconds until another connection attempt'
    )
    LogInstance.warn(
        `User service is ${UserSvcPing.isAlive() ? 'online' : 'offline'}`
    )

    return false
}

/**
 * wait until the required services are online
 */
const loop: NodeJS.Timeout = setInterval(() => {
    void EntryPoint().then((res) => {
        if (res === true) {
            clearInterval(loop)
        }
    })
}, 1000 * 5)

process
    .on('SIGINT', () => {
        instance.stop()
    })
    .on('SIGTERM', () => {
        instance.stop()
    })
