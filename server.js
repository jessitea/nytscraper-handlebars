

// Set Handlebars.


var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// var mongojs = require("mongojs");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/nytScraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

app.get("/", function(req,res){
		
		res.render("index");

});

app.get("/articles", function(req,res){

	Article.find({}, function(err, doc){

		res.render("articles", {article: doc});

	})	
});


// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.nytimes.com", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    var articles = [];
    // Now, we grab every h2 within an article tag, and do the following:
     $("h2.story-heading").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children().text();
      result.link = $(element).children().attr("href");
      // result.summary = $("p.summary").text();


      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      if (articles.length <= 10) {
      	articles.push(entry);
      }

      else if (result.title === "" || result.link === ""){
      	console.log("Blank entry");
      }
      else {

      	console.log("Greater than 10 articles");
      }


    });

     Article.collection.insert(articles, function(err, docs){
     		if(err){
     			res.send(err);
     		}
     		else{
     			res.redirect("/articles");
     		}
     })
  });

  
});

app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
      console.log(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  console.log("posted");

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": doc._id }}, {new : true })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.redirect('back');
        }
      });
    }
  });
});

app.get("/marksaved/:id", function(req, res) {
  // Remember: when searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

  Article.update({
    "_id": req.params.id
  },{
    $set: {
      "saved": true
    }
  },
  function(error, edited){

    if(error){
      console.log(error);
      res.send(error);
    }
    else {
      console.log(edited);
      res.redirect("back");
    }
  })

});

app.get("/saved", function(req,res){
    
    Article.find({}, function(err, doc){

    res.render("saved", {article: doc});

  });  

});

// Syncing our sequelize models and then starting our Express app
// =============================================================
app.listen(8080, function() {
  console.log("App running on port 8080!");
});


