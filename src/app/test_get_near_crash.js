

const UserService = require('./user-service');

// for unit testing
const admin = require("firebase-admin");


const serviceAccount = require("./../../config/serviceAccountKey.json");

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
});

const db = admin.firestore()

async function gerAllCrashCoordinates(db){
    const snapshotCrashData = await db.collection('crashHistory_test').get();

    const crashHistory = [];

    // load lat and long into an array
    snapshotCrashData.forEach(doc => {

        lat = doc.data().lat
        long = doc.data().long
        crashHistory.push([lat, long])
    });

    return crashHistory
}

function getNearbyCrashCoordinates(crashHistory, latlngs) {
    
    window = 0.0007
    
    const routeCoordinates =[]
    const outputCoordinates = []

    latlngs.forEach(element => {
        routeCoordinates.push([element.lat, element.lng])
    });

    crashHistory.forEach(crashPoint => {
        routeCoordinates.forEach(routePoint => {
            if((crashPoint[0] <= routePoint[0]+ window) && (crashPoint[0] >= routePoint[0]- window)){
                if((crashPoint[1] <= routePoint[1]+ window) && (crashPoint[1] >= routePoint[1] - window)){
                    outputCoordinates.push(routePoint)
            };  
        };  
        });
    });
    return outputCoordinates
}

get


console.log(crashHistory);
console.log(routeCoordinates);
console.log(outputCoordinates);

    



    // const snapshotNearbyCrashCoordinate = await crashHistory.where("lat", '<=', lat+window).where("lat", '>=', lat-window).where("long", '>=', long-window).where("long", '<=', long+window).get();
    
    // if(snaps)
    // // const getNearbyCrashCoordinate = await crashHistory.where("lat", '>=', lat+window);
    // for (var key in latlngs){
    //     lat = latlngs[key]["lat"];
    //     long = latlngs[key]["lng"];
    //     // console.log(`${latlngs[key]["lat"]} : ${latlngs[key]["lng"]}`);
    // }

    // return doc.data();

}

// describe('UserService', () => {

//     it('create users', async () => {

//         const latlong = 1

//         getNearbyCrashCoordinate(db,latlong);

//         // await UserService.createUserProfile(db, '133','kk@test.com','L','I','Driving')


//         console.log('passed')
//         // const user = await UserService.getUserById(db, '133')
        
//         // expect(user.email).toEqual('kk@test.com')

//         // await UserService.addTravelHistory(db,'asd','usa','CHINA','driving','2020')
//         // await UserService.addCrashHistory(db,'23esd','12','23','2020')
        
//     })
// })

const latlngs = [
    {
        "lat": 40.72327693,
        "lng": -73.9374092
    },
    {
        "lat": 40.75574,
        "lng": -73.95429
    },
    {
        "lat": 40.755680000000005,
        "lng": -73.9544
    },
    {
        "lat": 40.75558,
        "lng": -73.95458
    }]


getNearbyCrashCoordinate(db,latlngs);
