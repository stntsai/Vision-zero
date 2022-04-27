

const UserService = require('./user-service');

// for unit testing
const admin = require("firebase-admin");


const serviceAccount = require("./../../config/serviceAccountKey.json");

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
});

const db = admin.firestore()

describe('UserService', () => {

    it('create users', async () => {

        await UserService.createUserProfile(db, '133','kk@test.com','L','I','Driving')

        const user = await UserService.getUserById(db, '133')
        expect(user.email).toEqual('kk@test.com')

        await UserService.addTravelHistory(db,'asd','usa','CHINA','driving','2020')
        await UserService.addCrashHistory(db,'23esd','12','23','2020')
        
    })
})



// const UserService = require('./user-service');

// describe('UserService', () => {
//     it('creates users', async () => {
//         await UserService.createUser('123', 'danny@example.com', 'patient')
//         await UserService.createUser('234', 'bob@example.com', 'provider')

//         const user = await UserService.getUserById('test_id')
//         expect(user.email).toEqual('danny@example.com')
//         expect(user.role).toEqual('ok')
//     })
// })

