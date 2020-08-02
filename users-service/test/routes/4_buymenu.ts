import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

const buyMenuSchema = {
    type: 'object',
    required: [
        'owner_id',
        'pistols',
        'shotguns',
        'smgs',
        'rifles',
        'snipers',
        'machineguns',
        'melees',
        'equipment'
    ],
    properties: {
        owner_id: {
            type: 'integer',
            minimum: 1
        },
        pistols: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        shotguns: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        smgs: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        rifles: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        snipers: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        machineguns: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        melees: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        },
        equipment: {
            type: 'array',
            minItems: 9,
            maxItems: 9,
            items: {
                type: 'number'
            }
        }
    }
}

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

mocha.describe("User's buy menu", (): void => {
    let serviceInstance: ServiceInstance
    let firstUserId = -1
    let secondUserId = -1

    mocha.before((done: Mocha.Done): void => {
        // start service instance
        serviceInstance = new ServiceInstance()
        serviceInstance.listen()

        chai.request(serviceInstance.app)
            .post('/users')
            .send({
                username: 'testuser',
                playername: 'TestingUser',
                password: '222222'
            })
            .then((res: superagent.Response) => {
                firstUserId = res.body.id

                chai.request(serviceInstance.app)
                    .post('/users')
                    .send({
                        username: 'another_test_user',
                        playername: 'AnotherTestUser',
                        password: '123564'
                    })
                    .then((res: superagent.Response) => {
                        secondUserId = res.body.id
                        return done()
                    })
            })
    })

    mocha.describe('POST /inventory/:userId/buymenu', (): void => {
        mocha.it(
            'Should create a new buymenu for an user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}/buymenu`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(201)
                        res.body.should.be.jsonSchema(buyMenuSchema)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when creating a new buymenu for an user with an invalid user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/inventory/bad/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 409 when creating a buymenu while it already exists',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}/buymenu`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(409)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /inventory/:userId/buymenu', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })

        mocha.it("Should get an user's buy menu", (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get(`/inventory/${firstUserId}/buymenu`)
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema(buyMenuSchema)
                    return done()
                })
        })
        mocha.it(
            "Should 400 when getting an user's buy menu with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/bad/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 404 when getting an user's buy menu with a non existing user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('PUT /inventory/:userId/buymenu', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })

        mocha.it(
            "Should change an user's buy menu",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}/buymenu`)
                    .send({
                        smgs: [
                            5251,
                            5295,
                            162,
                            5132,
                            5346,
                            5320,
                            5287,
                            5321,
                            5310
                        ],
                        shotguns: [1, 2, 3, 0, 0, 0, 0, 0, 0]
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Check if the buy menu was changed successfully',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get(`/inventory/${firstUserId}/buymenu`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(buyMenuSchema)
                        chai.expect(res.body.smgs).to.deep.equal([
                            5251,
                            5295,
                            162,
                            5132,
                            5346,
                            5320,
                            5287,
                            5321,
                            5310
                        ])
                        chai.expect(res.body.shotguns).to.deep.equal([
                            1,
                            2,
                            3,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0
                        ])
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when changing a buy menu with an invalid user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/buymenu')
                    .send({
                        smgs: [
                            5251,
                            5295,
                            162,
                            5132,
                            5346,
                            5320,
                            5287,
                            5321,
                            5310
                        ]
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when changing an non existing buy menu',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/456789/buymenu')
                    .send({
                        smgs: [
                            5251,
                            5295,
                            162,
                            5132,
                            5346,
                            5320,
                            5287,
                            5321,
                            5310
                        ]
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('DELETE /inventory/:userId/buymenu', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/buymenu`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}/buymenu`)
                        .then(() => {
                            return done()
                        })
                })
        })

        mocha.it(
            "Should delete an user's buy menu",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}/buymenu`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when getting a deleted buy menu',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 400 when deleting a buy menu with a string as the owner's ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/bad/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when deleting a buy menu with a non existing owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/404/buymenu')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${secondUserId}/buymenu`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.after((done: Mocha.Done) => {
        chai.request(serviceInstance.app)
            .delete('/users/' + firstUserId)
            .send()
            .then(() => {
                chai.request(serviceInstance.app)
                    .delete('/users/' + secondUserId)
                    .send()
                    .then(() => {
                        serviceInstance.stop().then(() => {
                            return done()
                        })
                    })
            })
    })
})
