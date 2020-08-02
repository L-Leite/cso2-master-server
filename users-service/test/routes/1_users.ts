import chai from 'chai'
import chaiHttp from 'chai-http'
import chaiJson from 'chai-json-schema'
import mocha from 'mocha'
import superagent from 'superagent'

// add the src directory to the module search path
import { addPath } from 'app-module-path'
addPath(__dirname + '/../../src')

import { ServiceInstance } from 'serviceinstance'

import { USER_MAX_LEVEL } from 'entities/user'

import { SessionCounter } from 'sessioncounter'

// setup chai
chai.should()
chai.use(chaiHttp)
chai.use(chaiJson)

const userSchema = {
    type: 'object',
    required: [
        'id',
        'username',
        'playername',

        'gm',

        'points',
        'cash',
        'mpoints',

        'level',
        'cur_xp',
        'max_xp',
        'vip_level',
        'vip_xp',

        'rank',
        'rank_frame',

        'played_matches',
        'wins',
        'seconds_played',

        'kills',
        'deaths',
        'assists',
        'headshots',
        'accuracy',

        'avatar',
        'unlocked_avatars',

        'title',
        'unlocked_titles',
        'signature',

        'unlocked_achievements',

        'netcafe_name',

        'clan_name',
        'clan_mark',

        'world_rank',

        'best_gamemode',
        'best_map',

        'skill_human_curxp',
        'skill_human_maxxp',
        'skill_human_points',
        'skill_zombie_curxp',
        'skill_zombie_maxxp',
        'skill_zombie_points'
    ],
    properties: {
        id: {
            type: 'number',
            minimum: 1
        },
        username: {
            type: 'string'
        },
        playername: {
            type: 'string'
        },

        gm: {
            type: 'boolean'
        },

        points: {
            type: 'number'
        },
        cash: {
            type: 'number'
        },
        mpoints: {
            type: 'number'
        },

        level: {
            type: 'number',
            minimum: 1,
            maximum: USER_MAX_LEVEL
        },
        cur_xp: {
            type: 'string'
        },
        max_xp: {
            type: 'string'
        },
        vip_level: {
            type: 'number'
        },
        vip_xp: {
            type: 'number'
        },

        rank: {
            type: 'number'
        },
        rank_frame: {
            type: 'number'
        },

        played_matches: {
            type: 'number',
            minimum: 0
        },
        wins: {
            type: 'number',
            minimum: 0
        },
        seconds_played: {
            type: 'number',
            minimum: 0
        },

        kills: {
            type: 'number',
            minimum: 0
        },
        deaths: {
            type: 'number',
            minimum: 0
        },
        assists: {
            type: 'number',
            minimum: 0
        },
        headshots: {
            type: 'number',
            minimum: 0
        },
        accuracy: {
            type: 'number',
            minimum: 0
        },

        avatar: {
            type: 'number'
        },
        unlocked_avatars: {
            type: 'array',
            minItems: 128,
            maxItems: 128,
            items: {
                type: 'number'
            }
        },

        title: {
            type: 'number'
        },
        unlocked_titles: {
            type: 'array',
            minItems: 128,
            maxItems: 128,
            items: {
                type: 'number'
            }
        },
        signature: {
            type: 'string'
        },

        unlocked_achievements: {
            type: 'array',
            minItems: 128,
            maxItems: 128,
            items: {
                type: 'number'
            }
        },

        netcafe_name: {
            type: 'string'
        },

        clan_name: {
            type: 'string'
        },
        clan_mark: {
            type: 'number'
        },

        world_rank: {
            type: 'number'
        },

        best_gamemode: {
            type: 'number'
        },
        best_map: {
            type: 'number'
        },

        skill_human_curxp: {
            type: 'string'
        },
        skill_human_maxxp: {
            type: 'string'
        },
        skill_human_points: {
            type: 'number'
        },
        skill_zombie_curxp: {
            type: 'string'
        },
        skill_zombie_maxxp: {
            type: 'string'
        },
        skill_zombie_points: {
            type: 'number'
        }
    }
}

function IsStringBigInt(testStr: string): boolean {
    try {
        BigInt(testStr)
        return true
    } catch (error) {
        return false
    }
}

function UserSchema_TestBigInts(res: superagent.Response): void {
    IsStringBigInt(res.body.cur_xp).should.be.equal(true)
    IsStringBigInt(res.body.max_xp).should.be.equal(true)
    IsStringBigInt(res.body.skill_human_curxp).should.be.equal(true)
    IsStringBigInt(res.body.skill_human_maxxp).should.be.equal(true)
    IsStringBigInt(res.body.skill_zombie_curxp).should.be.equal(true)
    IsStringBigInt(res.body.skill_zombie_maxxp).should.be.equal(true)
}

mocha.describe('Users', (): void => {
    let serviceInstance: ServiceInstance

    mocha.before((): void => {
        serviceInstance = new ServiceInstance()
        serviceInstance.listen()
    })

    // test user creation first since other tests depend on it
    mocha.describe('POST /users', (): void => {
        let createdUserId: number = 0

        mocha.it('Should create a new user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(201)
                    res.body.should.be.jsonSchema(userSchema)
                    UserSchema_TestBigInts(res)
                    createdUserId = res.body.id
                    return done()
                })
        })
        mocha.it(
            'Should 400 when creating a new user with bad query parameters',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users')
                    .send({
                        badparam: 'testuser',
                        ugly: 'TestingUser'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 409 when creating a new user with an existing username/playername',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users')
                    .send({
                        username: 'testuser',
                        playername: 'TestingUser',
                        password: '222222'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(409)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + createdUserId)
                .send()
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /users', (): void => {
        let firstUserId: number = 0
        let secondUserId: number = 0

        mocha.before((done: mocha.Done): void => {
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
                            username: 'gamer',
                            playername: 'cso2player',
                            password: '123456'
                        })
                        .then((res2: superagent.Response) => {
                            secondUserId = res2.body.id
                            return done()
                        })
                })
        })

        mocha.it('Should get every user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get('/users')
                .query({
                    offset: 0,
                    length: 50
                })
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema({
                        type: 'array',
                        minItems: 2,
                        items: userSchema
                    })
                    return done()
                })
        })

        mocha.it('Should get the first user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get('/users')
                .query({
                    offset: 0,
                    length: 1
                })
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema({
                        type: 'array',
                        minItems: 1,
                        maxItems: 1,
                        items: userSchema
                    })
                    return done()
                })
        })

        mocha.it('Should get the second user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get('/users')
                .query({
                    offset: 1,
                    length: 1
                })
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema({
                        type: 'array',
                        minItems: 1,
                        maxItems: 1,
                        items: userSchema
                    })
                    return done()
                })
        })

        mocha.it(
            'Should 400 when getting an user page without query params',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )

        mocha.it(
            'Should 413 when requesting for an oversized users page',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users')
                    .query({
                        offset: 0,
                        length: 101
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(413)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + firstUserId)
                .send()
                .then(() => {
                    chai.request(serviceInstance.app)
                        .delete('/users/' + secondUserId)
                        .send()
                        .then(() => {
                            return done()
                        })
                })
        })
    })

    mocha.describe('GET /users/:userId', (): void => {
        let createdUserId: number = 0

        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .then((res: superagent.Response) => {
                    createdUserId = res.body.id
                    return done()
                })
        })

        mocha.it('Should get a specific user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .get('/users/' + createdUserId)
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    res.body.should.be.jsonSchema(userSchema)
                    UserSchema_TestBigInts(res)
                    return done()
                })
        })

        mocha.it(
            'Should 400 when getting an user with a string as user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/bad')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )

        mocha.it(
            'Should 404 when getting a non existing user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/404')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + createdUserId)
                .send()
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('PUT /users/:userId', (): void => {
        let createdUser: number = 0

        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .then((res: superagent.Response) => {
                    createdUser = res.body.id
                    return done()
                })
        })

        mocha.it("Should change an user's data", (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .put('/users/' + createdUser)
                .send({
                    wins: 16
                })
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    return done()
                })
        })
        mocha.it(
            "Check if the user's data was changed successfully",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/' + createdUser)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(userSchema)
                        UserSchema_TestBigInts(res)
                        chai.expect(res.body.wins).equal(16)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 400 when updated an user's data slots with an invalid user ID",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/users/bad')
                    .send({
                        kills: 300
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            "Should 404 when changing an unexisting user's data",
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .put('/users/404/')
                    .send({
                        deaths: 11
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + createdUser)
                .send()
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('DELETE /users/:userId', (): void => {
        let firstUser: number = 0
        let secondUser: number = 0

        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .then((res: superagent.Response) => {
                    firstUser = res.body.id
                    chai.request(serviceInstance.app)
                        .post('/users')
                        .send({
                            username: 'gamer',
                            playername: 'cso2player',
                            password: '123456'
                        })
                        .then((res2: superagent.Response) => {
                            secondUser = res2.body.id
                            return done()
                        })
                })
        })

        mocha.it('Should delete an user', (done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + firstUser)
                .end((err: Error, res: superagent.Response): void => {
                    res.should.be.status(200)
                    return done()
                })
        })
        mocha.it(
            'Should 404 when getting the deleted user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/' + firstUser)
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when deleting a non existing user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/users/404')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when deleting an user with a string as user ID',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/users/bad')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + secondUser)
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe('GET /users/byname/:username', (): void => {
        let createdUserId: number = 0

        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .then((res: superagent.Response) => {
                    createdUserId = res.body.id
                    return done()
                })
        })

        mocha.it(
            'Should get a specific user by its username',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/byname/testuser')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema(userSchema)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 400 when getting an user without an username',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/byname/')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 404 when getting a non existing user',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .get('/users/byname/idontexist')
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(404)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + createdUserId)
                .send()
                .then(() => {
                    return done()
                })
        })
    })

    mocha.describe(
        'POST /users/auth/login and /users/auth/logout',
        (): void => {
            let createdUserId: number = 0

            mocha.before((done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users')
                    .send({
                        username: 'testuser',
                        playername: 'TestingUser',
                        password: '222222'
                    })
                    .then((res: superagent.Response) => {
                        createdUserId = res.body.id
                        return done()
                    })
            })

            mocha.it(
                'Should authenticate an user',
                (done: mocha.Done): void => {
                    chai.request(serviceInstance.app)
                        .post('/users/auth/login')
                        .send({
                            username: 'testuser',
                            password: '222222'
                        })
                        .end((err: Error, res: superagent.Response): void => {
                            res.should.be.status(200)
                            res.body.should.be.jsonSchema({
                                type: 'object',
                                required: ['userId'],
                                properties: {
                                    userId: {
                                        type: 'number'
                                    }
                                }
                            })
                            res.body.userId.should.be.equal(createdUserId)

                            const sessionsNum: number = SessionCounter.Get()
                            sessionsNum.should.be.equal(1)

                            return done()
                        })
                }
            )

            mocha.it('Should log user out', (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users/auth/logout')
                    .send({
                        userId: createdUserId
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)

                        const sessionsNum: number = SessionCounter.Get()
                        sessionsNum.should.be.equal(0)

                        return done()
                    })
            })

            mocha.it(
                'Should 400 when authenticating with a bad query',
                (done: mocha.Done): void => {
                    chai.request(serviceInstance.app)
                        .post('/users/auth/login')
                        .send({
                            uuuuser: 'yes\n\r\t',
                            aeiou: 6789
                        })
                        .end((err: Error, res: superagent.Response): void => {
                            res.should.be.status(400)
                            return done()
                        })
                }
            )
            mocha.it(
                'Should 401 when authenticating with bad user credentials',
                (done: mocha.Done): void => {
                    chai.request(serviceInstance.app)
                        .post('/users/auth/login')
                        .send({
                            username: 'baduser',
                            password: 'badpassword'
                        })
                        .end((err: Error, res: superagent.Response): void => {
                            res.should.be.status(401)
                            return done()
                        })
                }
            )

            mocha.after((done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .delete('/users/' + createdUserId)
                    .send()
                    .then(() => {
                        return done()
                    })
            })
        }
    )
    mocha.describe('POST /users/auth/validate', (): void => {
        let createdUserId: number = 0

        mocha.before((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .post('/users')
                .send({
                    username: 'testuser',
                    playername: 'TestingUser',
                    password: '222222'
                })
                .then((res: superagent.Response) => {
                    createdUserId = res.body.id
                    return done()
                })
        })

        mocha.it(
            'Should say credentials are valid',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users/auth/validate')
                    .send({
                        username: 'testuser',
                        password: '222222'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(200)
                        res.body.should.be.jsonSchema({
                            type: 'object',
                            required: ['userId'],
                            properties: {
                                userId: {
                                    type: 'number'
                                }
                            }
                        })
                        res.body.userId.should.be.equal(createdUserId)
                        return done()
                    })
            }
        )

        mocha.it(
            'Should 400 when validating with a bad query',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users/auth/validate')
                    .send({
                        uuuuser: 'yes\n\r\t',
                        aeiou: 6789
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(400)
                        return done()
                    })
            }
        )
        mocha.it(
            'Should 401 when validating with bad user credentials',
            (done: mocha.Done): void => {
                chai.request(serviceInstance.app)
                    .post('/users/auth/validate')
                    .send({
                        username: 'baduser',
                        password: 'badpassword'
                    })
                    .end((err: Error, res: superagent.Response): void => {
                        res.should.be.status(401)
                        return done()
                    })
            }
        )

        mocha.after((done: mocha.Done): void => {
            chai.request(serviceInstance.app)
                .delete('/users/' + createdUserId)
                .send()
                .then(() => {
                    return done()
                })
        })
    })

    mocha.after(
        async (): Promise<void> => {
            await serviceInstance.stop()
        }
    )
})
