console.log('SERVER IS STARTING YO');

const express = require('express');
const app = express();
const server = app.listen(3000, listening);
const router = express.Router(); // Get express's router functions
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017'; // DB Connection URL
const dbName = 'cba';// Database Name

function listening() {
    console.log("listening....");
}

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding
app.use(express.static('public'));

//DB connect
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to MongoDB");

    const db = client.db(dbName);

    client.close();
});
