const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const searchTerms = new Schema ({
    term: String,
    dateCreated: Date
});

module.exports = searchTerms;