const gulp = require('gulp')
const log = require('fancy-log')
const path = require('path')
const util = require('util')

const { exec } = require('child_process')
const asyncExec = util.promisify(exec)

const DEFAULT_NETWORK_INTERFACE = 'eth0'

async function ExecCommand(command, cmdCwd = null, cmdEnv = null) {
    const fixedEnv = process.env

    if (cmdEnv != null) {
        Object.assign(fixedEnv, cmdEnv)
    }

    try {
        await asyncExec(command, { cwd: cmdCwd, env: fixedEnv })
        return { success: true }
    } catch (error) {
        return { success: false, error }
    }
}

async function BuildComponent(componentName) {
    const targetPath = path.resolve(`./${componentName}`)

    const instRes = await ExecCommand('yarn', targetPath)

    if (instRes.success === false) {
        log(`Failed to get ${componentName}'s dependencies. ${instRes.error}`)
        return false
    }

    log(`Installed ${componentName}'s dependencies successfully`)

    const buildRes = await ExecCommand('npx gulp build', targetPath)

    if (buildRes.success === false) {
        log(`Failed to build ${componentName}. ${buildRes.error}`)
        return false
    }

    log(`Built ${componentName} successfully`)
    return true
}

function StartComponent(componentName, args, cmdEnv) {
    const targetPath = path.resolve(`./${componentName}`)
    const fixedEnv = process.env

    if (cmdEnv != null) {
        Object.assign(fixedEnv, cmdEnv)
    }

    const ls = exec(`node ${args}`, { cwd: targetPath, env: fixedEnv })

    ls.stdout.on('data', (data) => {
        log(`${componentName}: ${data}`)
    })

    ls.stderr.on('data', (data) => {
        log.error(`${componentName}: ${data}`)
    })

    ls.on('close', (code) => {
        log(`${componentName} exited with code ${code}`)
    })

    log(`Started ${componentName} successfully`)
}

gulp.task('build', (cb) => {
    Promise.all([
        BuildComponent('master-server'),
        BuildComponent('users-service'),
        BuildComponent('website')
    ]).then(() => {
        cb()
    })
})

function FindNetworkInterface() {
    if (process.argv.length >= 5) {
        const key = process.argv[3]
        const value = process.argv[4]

        if (key === '--intf') {
            return value
        }
    }

    // fallback to the default interface
    return DEFAULT_NETWORK_INTERFACE
}

gulp.task('start', (cb) => {
    log("Starting game server's components...")

    const targetIntf = FindNetworkInterface()
    log(`Using "${targetIntf}" as the game server's net interface`)

    StartComponent('users-service', 'dist/service.js', {
        NODE_ENV: 'development',
        USERS_PORT: 30100,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'cso2'
    })

    StartComponent(
        'master-server',
        `dist/server.js --interface "${targetIntf}"`,
        {
            NODE_ENV: 'development',
            USERSERVICE_HOST: 'localhost',
            USERSERVICE_PORT: 30100
        }
    )

    StartComponent('website', 'dist/app.js', {
        NODE_ENV: 'development',
        WEBSITE_PORT: 8081,
        USERSERVICE_HOST: 'localhost',
        USERSERVICE_PORT: 30100
    })

    cb()
})
