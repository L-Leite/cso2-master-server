import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

mocha.describe('Ping', (): void => {
    let serviceInstance: ServiceInstance

    mocha.before((): void => {
        serviceInstance = new ServiceInstance()
        serviceInstance.listen()
    })

    mocha.describe('GET /ping', (): void => {
        mocha.it(
            "Should get the service's status",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/ping')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema({
                            type: 'object',
                            required: ['sessions', 'uptime'],
                            properties: {
                                sessions: {
                                    type: 'number',
                                    minimum: 0
                                },
                                uptime: {
                                    type: 'number',
                                    minimum: 0
                                }
                            }
                        })
                        return done()
                    })
            }
        )
    })

    mocha.after(
        async (): Promise<void> => {
            await serviceInstance.stop()
        }
    )
})
