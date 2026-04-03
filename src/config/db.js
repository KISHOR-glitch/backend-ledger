const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("server is connected to DB");
    } catch (err) {
        console.log("error connecting to DB:", err.message);
        process.exit(1);
    }
}

module.exports = connectToDB;