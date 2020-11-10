const request = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')
const {userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDataBase
} = require('./fixtures/db')

beforeEach(setupDataBase)

test('should create task for user', async ()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'test cases'
        })
        .expect(201)

        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull()
        expect(task.completed).toEqual(false)
})

test('should get all task for user one',async ()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

        expect(response.body.length).toEqual(2)
})

test('user two should not delet task of user one',async ()=>{
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
        
        const task = await Task.findById({_id: taskOne._id})
        expect(task).not.toBeNull()
})