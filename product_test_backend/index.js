var express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var assert = require('assert');
var dbName = 'CBA_Project';     // Database Name, change this to the name of your local MongoDB database
var url = `mongodb://localhost:27017/${dbName}`;
var ObjectID = require('mongodb').ObjectID;

var app = express();
var item;

// app.configure(function(){
//     app.use(express.bodyParser());
//     app.use(app.router);
// });

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

app.get('/get-data', function (req, res) {

    var inputId = { _id: new ObjectID(req.query.id)};

    //console.log("id.model_name + ' ' + id.timestamp");

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);
        var resultArray = [];
        var db = client.db(dbName);
        console.log("db: " + db.databaseName);

        db.collection("testing_database").find(inputId).toArray(function(err, result) {
            if(err) throw err;
            console.log(result.model_name, result);
            client.close();
            res.send(result);
        });
    });
    //res.redirect('/');
})

//inserting into MongoDB must be in the curly braces of the app.post
//Accepts the inputs from create a model form box
app.post('/create', function(req, res){
    console.log("The information entered is: ", req.body);
    
    item = {
        model_name: req.body.model_name,
        timestamp: req.body.timestamp
    };

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);

        const db = client.db(dbName);

        //This creates a collection if it does not already exist
        db.collection('testing_database').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('Item has been successfully inserted');
            
            //var objectId = item._id;
            //console.log(item.model_name+' id is: '+objectId);
        });

        client.close();
    });

    res.redirect('/');
});

function getDetails() {
    var userInput = document.getElementById('model_name').value;
    alert(userInput);
}

module.exports = app;