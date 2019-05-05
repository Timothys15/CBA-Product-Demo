var express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var assert = require('assert');

var dbName = 'testing';     // Database Name, change this to the name of your local MongoDB database
var url = `mongodb://localhost:27017/${dbName}`;
var ObjectID = require('mongodb').ObjectID;
var collectionOne = 'create_Model_Collection';
var collectionTwo = 'add_Document_Collection';

var fs = require('fs');
var Tokenizr = require('tokenizr');

var app = express();
var item;

// app.configure(function(){
//     app.use(express.bodyParser());
//     app.use(app.router);
// });

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

app.get('/get-data', function (req, res) {

    var inputName = req.body.id;

    //console.log("id.model_name + ' ' + id.timestamp");

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client){
        assert.equal(null, err);
        var resultArray = [];
        var db = client.db(dbName);
        console.log("db: " + db.databaseName);

        db.collection(`${collectionOne}`).find(inputName).toArray(function(err, result) {
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
        db.collection(`${collectionOne}`).insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('Item has been successfully inserted');
            
            //var objectId = item._id;
            //console.log(item.model_name+' id is: '+objectId);
        });

        client.close();
    });

    res.redirect('/');
});

app.post('/add-document', function (req, res) {
    console.log("The information entered is: ", req.body);
    var item = {
        model_name: req.body.model_name,
        plain_text: req.body.plain_text,
        tokenized_text: tokenizeDocument(req.body.plain_text)
    };

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);

        const db = client.db(dbName);

        //This creates a collection if it does not already exist
        db.collection(`${collectionTwo}`).insertOne(item, function (err, result) {
            assert.equal(null, err);
            console.log(`Item has been successfully inserted into ${collectionTwo}.`);

        });
    });
    res.redirect('/');
});

// USed to tokenize the input plain text data
function tokenizeDocument(inputDoc) {

    let lexer = new Tokenizr();
    var tokenizedDoc = [];

    lexer.rule(/[a-zA-Z]['a-zA-Z]*/, (ctx, match) => { //word
        ctx.accept("0")
    })
    lexer.rule(/[-+]?[0-9]\.?[0-9]+/, (ctx, match) => { //number match
        ctx.accept("0")
    })    
    lexer.rule(/[ \t\r\n]+/, (ctx, match) => { //ignore space, new lines, tabs, returns
        ctx.ignore()
    })
    lexer.rule(/./, (ctx, match) => { // chars
        ctx.accept("0")
    })

    let cfg = inputDoc;
    lexer.input(cfg);

    var splittedToken = [];
    var usableToken = "";

    lexer.tokens().forEach((token) => {
        splittedToken = token.toString().split(", text");
        usableToken = splittedToken[0].substr(1, splittedToken[0].length); //Removes < from the front of string

        splittedToken = usableToken.split((" ")); //Split token into 4 lots
        splittedToken[3] = splittedToken[3].replace(/^"(.*)"$/, '$1'); //Remove the "" surrounding the value
       
        usableToken = splittedToken.join(" "); // Join the token back up
        tokenizedDoc.push(usableToken); //Push into array
    });

    console.log(tokenizedDoc);
    return tokenizedDoc;
}

function getDetails() {
    var userInput = document.getElementById('model_name').value;
    alert(userInput);
}

module.exports = app;