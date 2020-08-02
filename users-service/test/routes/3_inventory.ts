import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

const inventorySchema = {
    type: 'object',
    required: ['owner_id', 'items'],
    properties: {
        owner_id: {
            type: 'number',
            minimum: 1
        },
        items: {
            type: 'array',
            required: ['item_id', 'ammount'],
            properties: {
                item_id: {
                    type: 'number',
                    minimum: 1
                },
                ammount: {
                    type: 'number',
                    minimum: 1
                }
            }
        }
    }
}

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

mocha.describe("User's a inventory", (): void => {
    let serviceInstance: ServiceInstance
    let firstUserId = -1
    let secondUserId = -1

    mocha.before((done: mocha.Done): void => {
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

    mocha.describe('POST /inventory/:userId', (): void => {
        mocha.it('Should create a new inventory', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}`)
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(201)
                    res.body.should.be.jsonSchema(inventorySchema)
                    return done()
                })
        })
        mocha.it(
            'Should 400 when creating an item in the user inventory with an invalid user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/inventory/fake')
                    .send({
                        itemId: 10092,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 409 when creating a new inventory with an existing userId',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(409)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/inventory/123456')
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /inventory/:userId', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}`)
                        .then(() => {
                            return done()
                        })
                })
        })

        mocha.it('Should get an user inventory', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get(`/inventory/${firstUserId}`)
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema(inventorySchema)
                    return done()
                })
        })
        mocha.it(
            'Should 400 when getting an inventory with a string as owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/bad')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when getting a non existing inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .delete(`/inventory/${secondUserId}`)
                        .then(() => {
                            return done()
                        })
                })
        })
    })

    mocha.describe('DELETE /inventory/:userId', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}`)
                        .then(() => {
                            return done()
                        })
                })
        })

        mocha.it(
            'Should delete an user inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when getting the deleted inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when deleting an inventory with a string as owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/bad')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when deleting a non existing inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/404')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${secondUserId}`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('PUT /inventory/:userId/item', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}`)
                .then(() => {
                    return done()
                })
        })

        mocha.it(
            'Should add an item to the user inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}/item`)
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a string as owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/item')
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a bad parameters',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}/item`)
                    .send({
                        ugly: 12345,
                        invalid: 'yes'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a string as owner ID and bad parameters',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/item')
                    .send({
                        ugly: 12345,
                        invalid: 'yes'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when adding an item to a non existing inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/404/item')
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('DELETE /inventory/:userId/item', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}`)
                        .then(() => {
                            chai.request(serviceInstance.app)
                                .put(`/inventory/${firstUserId}` + '/item')
                                .send({
                                    itemId: 12345,
                                    ammount: 1
                                })
                                .then(() => {
                                    chai.request(serviceInstance.app)
                                        .put(
                                            `/inventory/${firstUserId}` +
                                                '/item'
                                        )
                                        .send({
                                            itemId: 234567,
                                            ammount: 5
                                        })
                                        .then(() => {
                                            return done()
                                        })
                                })
                        })
                })
        })

        mocha.it(
            'Should delete an item to the user inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}` + '/item')
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should decrement an item's ammount from an user inventory",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}` + '/item')
                    .send({
                        itemId: 234567,
                        ammount: 2
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a string as owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/item')
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a bad parameters',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}` + '/item')
                    .send({
                        ugly: 12345,
                        invalid: 'yes'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when adding an inventory with a string as owner ID and bad parameters',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/item')
                    .send({
                        ugly: 12345,
                        invalid: 'yes'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when adding an item to a non existing inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/404/item')
                    .send({
                        itemId: 12345,
                        ammount: 1
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .delete(`/inventory/${secondUserId}`)
                        .then(() => {
                            return done()
                        })
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
