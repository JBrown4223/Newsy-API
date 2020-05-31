const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

let SALT = 10;

var Schema = mongoose.Schema;

const Users = new Schema ({
    userName: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    searchHistory: Array,
    categories: Array
});

Users.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT, function(err, salt){
           if(err)
            return next(err);
           else
            bcrypt.hash(user.password, salt, function(err, hash){
               if(err)
                   return next(err);
               else 
                   user.password = hash;
                   next();
            });
        })
    } else {
         return next();
    }

})

module.exports = Users;