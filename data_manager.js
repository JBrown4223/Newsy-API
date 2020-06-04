// ################################################################################
// Data service operations setup

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
let SALT = 10;

// Load the schemas...
const usersSchema = require('./msc_user');
const searchSchema = require('./msc_searchHistory');
const categorySchema = require('./msc_categories')

// Data entities; the standard format is:
module.exports = function(){
    let appUser;
    let searchTerms;
    let category;

        return {

            connect: function(){
                return new Promise((resolve, reject) =>{
                    // Create connection to the database
                    console.log('Attempting to connect to the database...');
      
                    // The following works for localhost...
                    // Replace the database name with your own value
                    mongoose.connect('mongodb+srv://dbUser12:Password12@cluster0-wtx2n.mongodb.net/Users?retryWrites=true&w=majority', { connectTimeoutMS: 5000, useUnifiedTopology: true });
      
                

                    // You can access the default connection using mongoose.connection.
                    var db = mongoose.connection;
      

                     db.on('error', (error) => {
                         console.log('Connection error:', error.message);
                         reject(error);
                     });
      
              
                    db.once('open', () => {
                        console.log('Connection to the database was successful');
                        appUser= db.model("Users", usersSchema, "Users");
                        searchTerms = db.model("SearchHistory", searchSchema, "SearchHistory");
                        category = db.model("Categories",categorySchema,"Categories")
                        resolve();
                    });
                });
                
            },

            //Sign Up
            userAdd: function(newUserItem){
                return new Promise((resolve,reject) =>{
                    appUser.create(newUserItem, function(err, item) {
                        if (err) {
                            return reject(console.error(err));
                        }
                            return resolve(item);
                      });
                });
            },

            //Authenticate
            authenticateUser: function(user, pass) {
              return new Promise((resolve, reject) =>{
                    
                    
                    /*bcrypt.genSalt(SALT, function(err, salt){
                    if(err)
                        return reject('fatal error');
                    else
                        bcrypt.hash(pass, salt, function(err, hash){
                          if(err)
                            return reject('error testing password');
                          else 
                              pass = hash;
                            });
                    })*/

                    appUser.findOne({
                         "userName": { "$regex": user, "$options": "i"}
                    }, function(err,item){
                        if(err)
                            return reject("failed to find match")
                        if (item)
                            return resolve(item);
                            
                    })
                });     
              
            },

            //Get User
            authorizedUser: function(username){
                const user = appUser;
                return new Promise((resolve, reject) =>{
                    user.findOne({"userName": { "$regex": username, "$options": "i"}}
                    ,(err, item) =>{
                      if(err)
                        return reject(error)
                      else if(item)
                        return resolve(item)
                      else
                        return reject('Failure to find user')
                    })
                    
                });
            },
            //Add Search History
            searchHistory: function(id,term){
                return new Promise((resolve,reject) =>{
                    appUser.findById(id, (err, item)=>{
                        if (err)
                            return reject(error);
                        if (item){
                           item.searchHistory.push(term);
                           item.save();
                           return resolve(item);
                        }
                        else
                            return reject(`Term could not be updated.`);
                    })
                    
                })
            },
            //Get Categories
            getCategories: function(id){
                return new Promise((resolve, reject) =>{
                    appUser.findById( id, (err, item) => {
                        if(err)
                          return reject(error);
                        if(item){
                            return resolve(item.categories);
                        }
                        else
                            return reject('This opperation failed')
                    })
                })
            }

            
        }
}