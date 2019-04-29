var express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var assert = require('assert');
var dbName = 'CBA_Project';     // Database Name, change this to the name of your local MongoDB database
var collectionOne = 'Create_Model_Collection';
var collectionTwo = 'add_Document_Collection';
var url = `mongodb://localhost:27017/${dbName}`;

var app = express();

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

app.get('/get-service1-data', function (req, res) {
    //The data from the MongoDB is loaded into data_array

    MongoClient.connect(url, {useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);
        var data_array = [];
        var db = client.db(dbName);

        db.collection(`${collectionOne}`).find().toArray(function(err, result) {
            if(err) throw err;
            console.log(result.model_name, result);
            client.close();
            res.send(result);
        });
    });
})

app.get('/get-service2-data', function (req, res) {
    MongoClient.connect(url, {useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);
        var data_array = [];
        var db = client.db(dbName);

        db.collection(`${collectionTwo}`).find().toArray(function(err, result) {
            if(err) throw err;
            console.log(result.model_id, result);
            client.close();
            res.send(result);
        });
    });
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
        db.collection(`${collectionOne}`).insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log(`Item has been successfully inserted into ${collectionOne}.`);

        });
    });

    res.redirect('/');
});

app.post('/add-document', function(req, res){
    console.log("The information entered is: ", req.body);
    var item = {
        model_id: req.body.model_id,
        plain_text: req.body.plain_text
    };

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);

        const db = client.db(dbName);

        //This creates a collection if it does not already exist
        db.collection(`${collectionTwo}`).insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log(`Item has been successfully inserted into ${collectionTwo}.`);

        });
    });

    res.redirect('/');
});

// USed to tokenize the input plain text data
function tokenizeDocument(inputDoc) {
    var tokenizedDoc = inputDoc.match(/(\w|([-+]?[0-9]*\.?[0-9]))+/g); //Match any word + any digit (float included)
    console.log(tokenizedDoc);
    return tokenizedDoc;
}

function getDetails() {
    var userInput = document.getElementById('model_name').value;
    alert(userInput);
}

module.exports = app;