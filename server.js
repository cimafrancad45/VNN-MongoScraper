var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Initialize Express
var app = express();


//handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Require all models
var db = require("./models");

var PORT = 3000;


//app.use public folder for assets
app.use(express.static(__dirname + '/public'));

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/NYTArticles", { useNewUrlParser: true });

// Routes
require("./routes/htmlRoutes.js")(app);
require("./routes/apiRoutes.js")(app);
// A GET route for scraping the echoJS website

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
