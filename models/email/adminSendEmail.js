const mongoose = require("mongoose");

const sendEmailSchema = new mongoose.Schema({
    subject: {
        type: "String",
        required: true
    },
    message: {
        type: "String",
        required: true
    }
});

const sendGeneralEmailByAdmin = mongoose.model('emails', sendEmailSchema);
module.exports = sendGeneralEmailByAdmin;