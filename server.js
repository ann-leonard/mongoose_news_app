var express = require("express");
var logger = require("morgan");

//Database requirements
var mongoose = require("mongoose");
var Article = require("./models/article");
var Note = require('./models/note')

var axios = require("axios");
var cheerio = require("cheerio");

var PORT = 3000;

// Initialize Express
var app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder                // Save these results in an object that we'll push into the results array we defined earlier

app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Set Handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Import routes and give the server access to them.
require("./routes/viewRoutes")(app, Article)

 app.get('/scrape', function (req, res) {
        console.log("your get dun got it")
        // Making a request via axios for Buzzfeed's news homepage
        axios.get("https://buzzfeednews.com").then(function (response) {
            // Load the Response into cheerio and save it to a variable
            var $ = cheerio.load(response.data);
            // Use cheerio to sort through each div with an article in it on the page and save selected info
            $(".newsblock-story-card").each(function (i, element) {
                //attach the info to an object to insert into mongoDB
                let result = {}
                result.title = $(element).find(".newsblock-story-card__title").text().trim();
                result.description = $(element).find(".newsblock-story-card__description").text().trim()
                result.link = $(element).find(".newsblock-story-card__link").attr("href")
                result.image = $(element).find(".newsblock-story-card__image-link")
                .find(".img-wireframe__image-container")
                .children(".newsblock-story-card__image")
                .attr("src")
               
                //insert final object into database
                Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        //throw errors except duplicate key entry
                        if(err.code != 11000){
                            console.log(err)
                        }
                    });
                    
            })

            // Log the results once you've looped through each of the elements found with cheerio
            //console.log(result);
            // redirect to loading screen
            res.redirect('/load')
        })
    })
    
// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function(req, res) {
  console.log("your get dun got it")
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
     res.render("comments", {article: dbArticle, note: dbArticle.note})
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/article/:id", function(req,res){

    Note.create(req.body).then(function(dbNote){
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }).then(function(dbArticle){
      console.log(dbArticle)
      res.redirect(`/article/${req.params.id}`)
    }).catch(function(err){
      if(err)console.log(err)
    })
})
})


app.listen(PORT, function() {
  console.log("~The magic happens on: PORT " + PORT + "~");
});
