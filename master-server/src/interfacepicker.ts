import os from 'os'
import readline from 'readline'

export interface INetIntf {
    name: string
    net: os.NetworkInterfaceBase
}

/**
 * builds a list of available network interfaces
 * for the server to run with
 */
function getAvailableInterfaces(): INetIntf[] {
    const results: INetIntf[] = []
    const netInterfaces = os.networkInterfaces()

    // the interfaces use string type keys
    for (const intfName in netInterfaces) {
        if (!netInterfaces.hasOwnProperty(intfName)) {
            continue
        }

        for (const intf of netInterfaces[intfName]) {
            // make sure it's an ipv4 interface and that it's not localhost or something
            if (intf.family !== 'IPv4' || intf.internal !== false) {
                continue
            }

            results.push({ name: intfName, net: intf })
        }
    }
    return results
}

/**
 * helper function that reads a number from the console's input
 */
function readChoiceFromConsole(): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.prompt()

    return new Promise<number>((resolve, reject) =>
        rl.on('line', (input: any): void => {
            const result: number = parseInt(input, 10)

            rl.close()

            if (isNaN(result)) {
                reject('Choice is not a number')
            } else {
                resolve(result)
            }
        })
    )
}

/**
 * queries the os for available network interfaces for the server to use
 * if it only finds one interface, it returns it
 * else it asks the user which one to use
 */
export async function getOrAskNetIntf(): Promise<INetIntf> {
    const interfaces: INetIntf[] = getAvailableInterfaces()

    if (interfaces.length === 0) {
        console.error('Could not find any valid network interface!')
        return null
    }

    let chosenIntf: INetIntf = null

    if (interfaces.length !== 1) {
        console.log('Please select an interface:')

        let printIndex = 0

        for (const intf of interfaces) {
            console.log(
                '(%i) - %s (%s)',
                printIndex++,
                intf.name,
                intf.net.address
            )
        }

        let choice = 0

        try {
            choice = await readChoiceFromConsole()
        } catch (error) {
            console.error(error)
            return null
        }

        if (choice < 0 || choice >= interfaces.length) {
            console.error('The user did not enter a number, exiting...')
            return null
        } else {
            chosenIntf = interfaces[choice]
        }
    } else {
        // if it finds only one interface, use it
        chosenIntf = interfaces[0]
    }

    console.log(
        'Using interface %s (%s)',
        chosenIntf.name,
        chosenIntf.net.address
    )
    return chosenIntf
}

/**
 * tries to find the user's desired interface from our interface list
 * and returns it
 * @param desiredIntf the user's desired interface
 */
export function getNetIntf(desiredIntf: string): INetIntf {
    const interfaces: INetIntf[] = getAvailableInterfaces()

    if (interfaces.length === 0) {
        console.error('Could not find any valid network interface!')
        return null
    }

    for (const intf of interfaces) {
        if (intf.name === desiredIntf) {
            console.log('Using interface %s (%s)', intf.name, intf.net.address)
            return intf
        }
    }

    console.error('The user requested an invalid interface...')
    return null
}
