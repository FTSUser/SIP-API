const fs = require("firebase-admin");
const serviceAccount = require("../../service-account-test.json"); 

module.exports = async (logger) => {

    // Initialize Firebase
    fs.initializeApp({
        credential: fs.credential.cert(serviceAccount),
    });

    const db = fs.firestore(); // database instance

    
    // Add a new document with a generated id.
    // const res = await db.collection('users').add({
    //     name: 'Tokyo',
    //     country: 'Japan'
    // });
    
    // console.log('Added document with ID: ', res.id);

    // log the result
    // logger.info(`Added document with ID: ${res.id}`);

    if (models) {
        global.models = models;
        logger.info("Database connections and models created successfully!");
        console.log("models", models);
    } else {
        // If the connections and database models are not created, kill the process
        logger.error("Creating database connections and models failed!");
        process.kill(process.pid, "SIGTERM");
    }
};
