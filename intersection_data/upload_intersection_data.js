const csv = require('csv-parser');
const fs = require('fs');
const UserService = require('./../src/app/user-service')

// for unit testing
const admin = require("firebase-admin");


const serviceAccount = require("./../config/serviceAccountKey.json");

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
});

const db = admin.firestore()

fs.createReadStream('intersection_data_for_fire_base_all.csv')
  .pipe(csv())
  .on('data', async (row) => {

    await UserService.addCrashHistory(db,row.index,row.CRASH_TIME, row.latitude, row.longitude)
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });