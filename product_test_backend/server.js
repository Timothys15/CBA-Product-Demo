console.log('SERVER IS STARTING YO');

const express = require('express');
const app = express();
const PORT = 3000; // Specify a network port
const server = app.listen(PORT, listening);
const router = express.Router(); // Get express's router functions
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017'; // DB Connection URL
const dbName = 'cba';// Database Name

function listening() {
    console.log(`Server is running on port ${PORT} at 'http://localhost:${PORT}' (CTRL + C to exit)`);
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
