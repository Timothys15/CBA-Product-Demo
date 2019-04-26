var express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var assert = require('assert');
var dbName = 'CBA_Project';     // Database Name, change this to the name of your local MongoDB database
var url = `mongodb://localhost:27017/${dbName}`;

var app = express();

// app.configure(function(){
//     app.use(express.bodyParser());
//     app.use(app.router);
// });

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

app.get('/get-data', function (req, res) {

})

//inserting into MongoDB must be in the curly braces of the app.post
//Accepts the inputs from create a model form box
app.post('/create', function(req, res){
    console.log("The information entered is: ", req.body);
    var item = {
        model_name: req.body.model_name,
        timestamp: req.body.timestamp
    };

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);

        const db = client.db(dbName);

        //This creates a collection if it does not already exist
        db.collection('testing_database_#').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('Item has been successfully inserted');

        });
    });

    res.redirect('/');
});

function getDetails() {
    var userInput = document.getElementById('model_name').value;
    alert(userInput);
}

module.exports = app;