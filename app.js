const express = require('express');
const app = express();

// serve static files from the folder "public"
app.use(express.static('public'));

module.exports = app;
