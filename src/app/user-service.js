
// // for unit testing
// const admin = require("firebase-admin");

// const serviceAccount = require("./../../config/serviceAccountKey.json");

// admin.initializeApp({
//     credential:admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore()


module.exports = {

    createUserProfile: async (db, email, firstName, lastName, preferredMode) =>{
        const docRef = db.collection('users').doc(email)
        await docRef.set({
            email:email,
            firstName:firstName,
            lastName: lastName,
            preferredMode: preferredMode
        })
    },

    addTravelHistory: async (db, email, orgin, destination, travelMode, SearchTime) =>{
        const docRef = db.collection('travelHistory').doc()
        await docRef.set({
            email:email,
            orgin:orgin,
            destination:destination,
            travelMode: travelMode,
            SearchTime: SearchTime
        })
    },

    addCrashHistory: async (db, crashId, time, lat, long) =>{
        const docRef = db.collection('crashHistory').doc(crashId)
        await docRef.set({
            time: time,
            long:long,
            lat:lat
        })
    },
    
    getUserByEmail:  async (db, email) => {
        const doc = await db.collection('users').doc(email).get();
        return doc.data();
    },

    // TODO: build "get travel history by id"
    getTravelHistoryByEmail:  async (db, email) => {
        
        const travelHistory = db.collection("travelHistory")
        const indivTravelHistory = await travelHistory.where("email", '==', email).get();

        return indivTravelHistory.data();
    },

    gerAllCrashCoordinates:  async (db) => {
        const snapshotCrashData = await db.collection('crashHistory_test').get();

        const crashHistory = [];

        // load lat and long into an array
        snapshotCrashData.forEach(doc => {

            lat = doc.data().lat
            long = doc.data().long
            crashHistory.push([lat, long])
        });

        return crashHistory
    },

    getNearbyCrashCoordinates: (crashHistory, latlngs) => {
        
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
    },

    getNearbyCrashCoordinates_previous:  async (db, latlngs) => {
        
        window = 0.0007
        const snapshotCrashData = await db.collection('crashHistory_test').get();

        const crashHistory = [];
        const routeCoordinates =[]
        const outputCoordinates = []


        // load lat and long into an array
        snapshotCrashData.forEach(doc => {

            lat = doc.data().lat
            long = doc.data().long
            crashHistory.push([lat, long])
        });

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
}



// const admin = require("firebase-admin");
// const serviceAccount = require("./../../config/serviceAccountKey.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// module.exports = {
//     createUser: async (id, email, role) => {
//         const docRef = db.collection('users').doc(id)
//         await docRef.set({
//             email: email,
//             role: role,
//         })
//     },

//     getUserById: async (id) => {
//         const doc = await db.collection('users').doc(id).get()
//         if (!doc.exists) {
//           console.log('No such document!');
//           return null;
//         } else {
//           return doc.data();
//         }
//     }
// }