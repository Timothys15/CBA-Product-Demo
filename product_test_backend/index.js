var express = require('express');
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
var assert = require('assert');
var dbName = 'testing';     // Database Name, change this to the name of your local MongoDB database
var collectionOne = 'Create_Model_Collection';
var collectionTwo = 'add_Document_Collection';
var url = `mongodb://localhost:27017/${dbName}`;
const fetch = require("node-fetch");

var fs = require('fs');
var Tokenizr = require('tokenizr');

var app = express();

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/annotate', function (req, res) {
    res.sendFile(__dirname + '/document_annotate.html');
});

app.get('/get-service1-data', function (req, res) {
    //The data from the MongoDB is loaded into data_array

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        var data_array = [];
        var db = client.db(dbName);

        db.collection(`${collectionOne}`).find().toArray(function (err, result) {
            if (err) throw err;
            console.log(result.model_name, result);
            client.close();
            res.send(result);
        });
    });
})

app.get('/get-service2-data', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        var data_array = [];
        var db = client.db(dbName);

        db.collection(`${collectionTwo}`).find().toArray(function (err, result) {
            if (err) throw err;
            console.log(result.model_id, result);
            client.close();
            res.send(result);
        });
    });
})

app.get('/get-data/:modelName', function (req, res) {

    var inputName = { model_name: req.params.modelName };
    console.log(inputName);
    //console.log("id.model_name + ' ' + id.timestamp");

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        var resultArray = [];
        var db = client.db(dbName);
        //console.log(inputName);
        console.log("db: " + db.databaseName);

        db.collection(`${collectionTwo}`).find(inputName).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            res.end(JSON.stringify(result));
            client.close();
        });
    });
})

app.get('/getAllDocuments', function (req, res) {

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        var db = client.db(dbName);

        db.collection(`${collectionTwo}`).find({}, { projection: { _id: 1, model_id: 1 } }).toArray(function (err, document) {
            if (err) throw err;

            res.send(JSON.stringify(document));
            client.close();
        });
    });

})

app.get('/document/:id', function (req, res) {
    var docId = req.params.id;
    console.log(docId);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        var db = client.db(dbName);

        db.collection(`${collectionTwo}`).findOne({ _id: new ObjectId(docId) }, function (err, document) {
            var temp = [{ id: "", value: "" }];
            var splitWord = [];
            document.tokenized_text.forEach(element => {
                splitWord = element.split(("\t"));
                temp.push({ id: splitWord[0], value: splitWord[1] })
                document.tokenized_text = temp;
            });
            res.send(JSON.stringify(document));
            client.close();
        });
    });
})

app.post('/update/entity/:id/:word/:entity', function (req, res) {
    var docInfo = req.body;
    fetch(`http://127.0.0.1:8080/document/${docInfo.docID}`)
        .then(res => res.json())
        .then(function (data) {
            var index = findWord(data.tokenized_text, docInfo.word);
            if (index != -1) {
                MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

                    var db = client.db(dbName);
                    var setIndex = "tokenized_text."+index;
                    var toUpdate = docInfo.word+"\t"+docInfo.value;
                    db.collection(`${collectionTwo}`).updateOne(
                        { "_id": new ObjectId(docInfo.docID) },
                        { $set: { [setIndex] : toUpdate} }
                    );
                });
            } else {
                console.log("something happened");
            }
        })
        .then(function () { 
            res.end('{"success" : "Updated Successfully", "status" : 200}');
        })
        .catch(err => console.error(err));
})

function findWord(text, word) {
    for (var i = 0; i < text.length; i += 1) {
        if (text[i]["id"] === word) {
            return i-1;
        }
    }
    return -1;
}

app.post('/update/:id', function (req, res) {
    // console.log(req.body);
})




//inserting into MongoDB must be in the curly braces of the app.post
//Accepts the inputs from create a model form box
app.post('/create', function (req, res) {
    console.log("The information entered is: ", req.body);
    var item = {
        model_name: req.body.model_name,
        timestamp: req.body.timestamp
    };

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);

        const db = client.db(dbName);

        //This creates a collection if it does not already exist
        db.collection(`${collectionOne}`).insertOne(item, function (err, result) {
            assert.equal(null, err);
            console.log(`Item has been successfully inserted into ${collectionOne}.`);

        });
    });

    res.redirect('/');
});

app.post('/add-document', function (req, res) {
    console.log("The information entered is: ", req.body);
    var item = {
        model_id: req.body.model_id,
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
    var tempToken = "";

    lexer.tokens().forEach((token) => {
        splittedToken = token.toString().split(", text");
        usableToken = splittedToken[0].substr(1, splittedToken[0].length); //Removes < from the front of string

        splittedToken = usableToken.split((" ")); //Split token into 4 lots
        splittedToken[3] = splittedToken[3].replace(/^"(.*)"$/, '$1'); //Remove the "" surrounding the value
        tempToken = splittedToken[3] + "\t" + splittedToken[1].substr(0, splittedToken[1].length - 1);

        tokenizedDoc.push(tempToken); //Push into array
    });

    console.log(tokenizedDoc);
    saveToDoc(tokenizedDoc);
    return tokenizedDoc;
}

function saveToDoc(data) {

    var logger = fs.createWriteStream('log.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
    });

    for (var i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
            logger.write("\r\n");
        } else {
            logger.write(data[i].substr(0, data[i].length - 1) + "\r\n");
        }
    }
}

function getDetails() {
    var userInput = document.getElementById('model_name').value;
    alert(userInput);
}

module.exports = app;