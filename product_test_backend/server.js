const express = require('express');
const app = express();
const PORT = 8080; // Specify a network port
const server = app.listen(PORT, listening);
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017'; // DB Connection URL
const dbName = 'CBA_Project';// Database Name, change this to the name of your local MongoDB database

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testing', { useNewUrlParser: true });
var dbs = mongoose.connection;
dbs.on('error', console.error.bind(console, 'MongoDB connection error:'));

function listening() {
    console.log(`Server is running on port ${PORT} at 'http://localhost:${PORT}' (CTRL + C to exit)`);
}
app.use(require('./routes/index'));
app.use(require('./routes/annotation'));

app.use(bodyParser.json()); // Parse input text to JSON
app.use(bodyParser.urlencoded({ extended: true })); // Ensure proper/safe URL encoding
app.use("/public", express.static('./public'));



//DB connect
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    assert.equal(null, err);
    console.log(`Connected successfully to MongoDB, you can now access the database "${dbName}" successfully.`);

    const db = client.db(dbName);

    client.close();
});
