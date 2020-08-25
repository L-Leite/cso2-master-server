const gulp = require('gulp')
const log = require('fancy-log')
const yarn = require('gulp-yarn')
const { spawn } = require('child_process')

function SpawnGulpBuild(componentName, cwd) {
    const ls = spawn('npx', ['gulp', 'build'], { cwd })

    ls.stdout.on('data', (data) => {
        log(`build of ${componentName}: ${data}`)
    })

    ls.stderr.on('data', (data) => {
        log.error(`build of ${componentName}: ${data}`)
    })

    ls.on('close', (code) => {
        log(`build of ${componentName} exited with code ${code}`)
    })
}

function BuildComponent(componentDir) {
    gulp.src([
        `./${componentDir}/package.json`,
        `./${componentDir}/yarn.lock`
    ]).pipe(yarn())
    SpawnGulpBuild(componentDir, `./${componentDir}`)
    log(`Built ${componentDir} successfully`)
}

function StartComponent(componentName, args, env, cwd) {
    const ls = spawn('node', args, { env, cwd })

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
    log("Building game server's components...")
    BuildComponent('master-server')
    BuildComponent('users-service')
    BuildComponent('website')
    cb()
})

gulp.task('start', (cb) => {
    log("Starting game server's components...")

    StartComponent(
        'users-service',
        ['dist/service.js'],
        {
            NODE_ENV: 'development',
            USERS_PORT: 30100,
            DB_HOST: 'localhost',
            DB_PORT: 5432,
            DB_NAME: 'cso2'
        },
        './users-service'
    )

    StartComponent(
        'master-server',
        ['dist/server.js', '--interface', 'enp4s0'],
        {
            NODE_ENV: 'development',
            USERSERVICE_HOST: 'localhost',
            USERSERVICE_PORT: 30100
        },
        './master-server'
    )

    StartComponent(
        'website',
        ['dist/app.js'],
        {
            NODE_ENV: 'development',
            WEBSITE_PORT: 8081,
            USERSERVICE_HOST: 'localhost',
            USERSERVICE_PORT: 30100
        },
        './website'
    )

    cb()
})
