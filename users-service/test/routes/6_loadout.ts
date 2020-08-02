import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

const loadoutSchema = {
    type: 'object',
    required: [
        'owner_id',
        'loadout_num',
        'primary_weapon',
        'secondary_weapon',
        'melee',
        'hegrenade',
        'flash',
        'smoke'
    ],
    properties: {
        owner_id: {
            type: 'number',
            minimum: 1
        },
        loadout_num: {
            type: 'number',
            minimum: 0,
            maximum: 2
        },
        primary_weapon: {
            type: 'number'
        },
        secondary_weapon: {
            type: 'number'
        },
        melee: {
            type: 'number'
        },
        hegrenade: {
            type: 'number'
        },
        flash: {
            type: 'number'
        },
        smoke: {
            type: 'number'
        }
    }
}

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

mocha.describe("User's loadout", (): void => {
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

    mocha.describe('POST /inventory/:userId/loadout', (): void => {
        mocha.it(
            'Should create new loadouts for an user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}/loadout`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(201)
                        res.body.should.be.jsonSchema({
                            type: 'array',
                            minItems: 3,
                            maxItems: 3,
                            uniqueItems: true,
                            items: loadoutSchema
                        })
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when creating new loadouts for an user with an invalid user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/inventory/bad/loadout')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 409 when creating a loadouts while they already exist',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post(`/inventory/${firstUserId}/loadout`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(409)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /inventory/:userId/loadout/:loadoutNum', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    return done()
                })
        })

        mocha.it("Should get an user's loadout", (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get(`/inventory/${firstUserId}/loadout/0`)
                .send()
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema(loadoutSchema)
                    return done()
                })
        })
        mocha.it(
            "Should 400 when getting an user's loadout with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/bad/loadout/0')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 404 when getting an user's loadout with a non existing user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404/loadout/0')
                    .send()
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('PUT /inventory/:userId/loadout', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    return done()
                })
        })

        mocha.it(
            "Should change an user's loadout",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put(`/inventory/${firstUserId}/loadout/0`)
                    .send({
                        primary_weapon: 52180,
                        hegrenade: 532468,
                        flash: 33214
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Check if the loadout was changed successfully',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get(`/inventory/${firstUserId}/loadout/0`)
                    .send()
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(loadoutSchema)
                        chai.expect(res.body.primary_weapon).equal(52180)
                        chai.expect(res.body.hegrenade).equal(532468)
                        chai.expect(res.body.flash).equal(33214)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when changing a loadout with an invalid user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/bad/loadout/0')
                    .send({
                        primary_weapon: 52180,
                        hegrenade: 532468,
                        flash: 33214
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when changing a loadout with an invalid loadout slot',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/${firstUserId}/loadout/3')
                    .send({
                        primary_weapon: 52180,
                        hegrenade: 532468,
                        flash: 33214
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when changing an unexisting loadout slots',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/inventory/456789/loadout/0')
                    .send({
                        primary_weapon: 52180,
                        hegrenade: 532468,
                        flash: 33214
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('DELETE /inventory/:userId/loadout', (): void => {
        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post(`/inventory/${firstUserId}/loadout`)
                .then(() => {
                    chai.request(serviceInstance.app)
                        .post(`/inventory/${secondUserId}/loadout`)
                        .then(() => {
                            return done()
                        })
                })
        })

        mocha.it(
            "Should delete an user's loadouts",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete(`/inventory/${firstUserId}/loadout`)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when getting a deleted loadout',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/inventory/404/loadout')
                    .send({
                        loadoutNum: 0
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when deleting a loadouts with a string as owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/bad/loadout')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when deleting loadouts with a non existing owner ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/inventory/404/loadout')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete(`/inventory/${secondUserId}/loadout`)
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
