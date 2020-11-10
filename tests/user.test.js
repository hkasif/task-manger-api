const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne,userOneId,setupDataBase} = require('./fixtures/db')

beforeEach(setupDataBase)

test('should create a user',async ()=>{
    const response = await request(app).post('/users').send({
        name: 'Asif Khan',
        email: 'demo@gmail.com',
        password: 'demo123'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
        user: {
            name: 'Asif Khan'
        }
    })
})

test('should login existing user',async ()=>{
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login non existing user',async ()=>{
    await request(app).post('/users/login').send({
        email: 'demo@gmail.com',
        password: 'demo234'
    }).expect(400)
})

test('should get profile for authorised user',async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get profile for unauthorised user',async ()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete authorised user',async ()=>{
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete unauthorised user',async ()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('should upload avtar image',async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))

})

test('should update user profile',async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'HK Khan'
        })
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.name).toEqual('HK Khan')
})

test('should not update invalid user profile', async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Churu'
        })
        .expect(400)
})