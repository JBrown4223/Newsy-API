

const express = require('express');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const tokenTime = 36000;
const withAuth = require('./middleware');
const manager = require('./data_manager');

const app = express();

const secret = 'mysecretsshhh';
const m = manager();
const newsapi = new NewsAPI('b8f0f656a0f7408897d688c8a8f27ae1');
const HTTP_PORT = process.env.PORT || 8080;
//////////////////////////////////////////////////////////////
function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

//////////////////////////////////////////////////////////////
app.use(bodyParser.json());
app.use(cors());

////////////////////////////////////////////////////////////////



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
    // Here are the resources that are available for users of this web API...
    // YOU MUST EDIT THIS COLLECTION
    const links = [];
    // This app's resources...
    links.push({ "rel": "collection", "href": "/api/users", "methods": "GET,POST,PUT,DELETE" });
  
    const linkObject = { 
      "apiName": "Newsy Api",
      "apiDescription": "Web API for Newsy DB",
      "apiVersion": "1.0", 
      "apiAuthor": "Jonathan Brown",
      "links": links
    };
    res.json(linkObject);
  });

  app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });
  

//Add New User
app.post("/api/users/add", (req,res)=>{
    m.userAdd(req.body)
    .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(500).json({ "message": error });
      })

});

//Authenticate User
app.post("/api/users/auth", (req,res)=>{
    username = req.body.username;
    m.authenticateUser(username, req.body.password)
    .then((data) =>{
        
          const token = jwt.sign({username}, secret, {
            expiresIn: tokenTime
          });
          res.status(200).json({token: token});
          console.log(data);
    })
    .catch((error) =>{
        res.status(500).json({error});
    })
});

//Get the Authorized User Information
app.get("/api/users/:id", (req,res)=>{
    m.authorizedUser(req.params.id)
    .then((data) =>{
        res.status(200).json(data);
    })
    .catch((error) =>{
        res.status(404).json(error);
    })
})

//Get the top US stories 
app.get("/api/us-news/:id", (req, res)=>{
        newsapi.v2.topHeadlines({
           language: 'en',
           country: 'us',
           sortBy: 'relevancy',
           page: 2
          }).then(response => {
             res.status(200).json(response.articles);
             console.log(response);
          }); 
});

//Get the top Canadian stories
app.get("/api/can-news/:id", (req,res) =>{
        newsapi.v2.topHeadlines({
            language: 'en',
            country: 'ca',
            sortBy: 'relevancy',
            page: 2
        }).then(response2 => {
          res.status(200).json(response2.articles);  
          console.log(response2);
        });    
});


app.get("/api/newsSearch/:search", (req,res)=>{
  newsapi.v2.everything({
    q: req.params.search,
    language: 'en',
    from: '2020-04-15',
    sortBy: 'relevancy',
   }).then(response => {
             res.status(200).json({response})  
         
   });
});

//Add to history
app.post("/api/addHistory/:id", (req,res) =>{
    m.searchHistory(req.params.id, req.body)
    .then((data) =>{
       res.status(200).json(data);
       console.log("Saved!");
    })
    .catch((error) =>{
       res.status(404).json(error);
       console.log("Something Ain't Right Dawgy")
    })
})
       

//Not found
app.use((req, res) => {
    res.status(404).send("Resource not found");
  });

m.connect().then(() => {
    app.listen(HTTP_PORT, () => { console.log("Ready to handle requests on port " + HTTP_PORT) });
  })
  .catch((err) => {
      console.log("Unable to start the server:\n" + err);
      process.exit();
 });

 /*
    Routes to the App Server
    https://newsyserver.azurewebsites.net/

 */ 