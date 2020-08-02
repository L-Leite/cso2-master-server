import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

const cosmeticsSchema = {
    type: 'object',
    required: [
        'owner_id',
        'ct_item',
        'ter_item',
        'head_item',
        'glove_item',
        'back_item',
        'steps_item',
        'card_item',
        'spray_item'
    ],
    properties: {
        owner_id: {
            type: 'number',
            minimum: 1
        },
        ct_item: {
            type: 'number',
            minimum: 1
        },
        ter_item: {
            type: 'number',
            minimum: 1
        },
        head_item: {
            type: 'number'
        },
        glove_item: {
            type: 'number'
        },
        back_item: {
            type: 'number'
        },
        steps_item: {
            type: 'number'
        },
        card_item: {
            type: 'number'
        },
        spray_item: {
            type: 'number'
        }
    }
}

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

mocha.describe("User's cosmetics", (): void => {
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

    mocha.describe('POST /inventory/:userId/cosmetics', (): void => {
        mocha.it(
            "Should create new user's cosmetics slots",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}/cosmetics`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(201)
                        res.body.should.be.jsonSchema(cosmeticsSchema)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 400 when creating new user's cosmetics slots with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/inventory/bad/cosmetics')
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
                    .post(`/inventory/${firstUserId}/cosmetics`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(409)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /inventory/:userId/cosmetics', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    return done()
                })
        })

        mocha.it(
            "Should get an user's currently equipped cosmetics",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get(`/inventory/${firstUserId}/cosmetics`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(cosmeticsSchema)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 400 when getting an user's currently equipped cosmetics with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/bad/cosmetics')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 404 when getting an user's currently equipped cosmetics with a non existing user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404/cosmetics')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('PUT /inventory/:userId/cosmetics', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    return done()
                })
        })

        mocha.it(
            "Should change an user's cosmetics slots",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}/cosmetics`)
                    .send({
                        head_item: 10046,
                        glove_item: 30009,
                        spray_item: 42009
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Check if the cosmetic slots were changed successfully',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get(`/inventory/${firstUserId}/cosmetics`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(cosmeticsSchema)
                        chai.expect(res.body.head_item).equal(10046)
                        chai.expect(res.body.glove_item).equal(30009)
                        chai.expect(res.body.spray_item).equal(42009)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 400 when creating new user's cosmetics slots with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/cosmetics')
                    .send({
                        head_item: 10046,
                        glove_item: 30009,
                        spray_item: 42009
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 404 when changing an unexisting user's cosmetic slots",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/876543/cosmetics')
                    .send({
                        head_item: 10046,
                        glove_item: 30009,
                        spray_item: 42009
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('DELETE /inventory/:userId/cosmetics', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/cosmetics`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}/cosmetics`)
                        .then(() => {
                            return done()
                        })
                })
        })

        mocha.it(
            'Should delete an user inventory',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}/cosmetics`)
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
                    .get('/inventory/404/cosmetics')
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
                    .delete('/inventory/bad/cosmetics')
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
                    .delete('/inventory/404/cosmetics')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${secondUserId}/cosmetics`)
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
