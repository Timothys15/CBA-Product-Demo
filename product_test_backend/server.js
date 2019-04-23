console.log('SERVER IS STARTING YO');

var express = require('express');

var app = express ();

var server = app.listen(3000, listening);

function listening() {
    console.log("listening....");
}

app.use(express.static('public'));