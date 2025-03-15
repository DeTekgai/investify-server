const mongoose = require("mongoose");
require("dotenv").config();
const DB_URL = process.env.DB_URL

const mongoDBConnection = async () => {
   await mongoose.connect(DB_URL).then(() => {
        console.log("MongoDB connected...")
    }).catch((err) => {
        console.error("Mongodb error", err);
        
    })
}

module.exports = mongoDBConnection;