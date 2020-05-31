const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const Categories = new Schema ({
    category: String,
});

module.exports = Categories;