//dependencies for the app
const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = function (app) {
    //scrape function 
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        axios.get("https://www.vocaloidnews.net/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("h2").each(function (i, element) {
                // Save an empty result object
                var result = {};
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });
            $("div")
            // If we were able to successfully scrape and save an Article, send a message to the client
            res.send("Scrape Successful!");
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    //route for getting articles that haven't been saved
    app.get("/articles/saved=false", function (req, res) {
        //$ne = value of the opposite, so in this case, false
        db.Article.find({ saved: { $ne: true } })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            })
    })
    //same code as above but for saved articles
    app.get("/articles/saved=true", function (req, res) {
        db.Article.find({ saved: true })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            })
    })

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
    //route for getting article's notes body
    app.get("/articles/notes/:id", function (req, res) {
        db.Note.findOne({ _id: req.params.id })
            .populate("note.Note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    app.post("/articles/:id", function (req, res) {
        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { upsert: true })
                    .then(function (dbArticle) {
                        res.json(dbArticle);
                    })
                    .catch(function (err) {
                        res.json(err);
                    });
            });
    });
    //route for getting article note body
    app.get("/notes/saved/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.find({ _id: req.params.id })
            .then(function (dbNote) {
                res.json(dbNote);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    // Route for deleting an Article's note
    app.post("/notes/delete/:id", function (req, res) {
        db.Note.remove({ _id: req.params.id })
            .then(function () {
                db.Article.findOneAndUpdate(query, { $pull: { note: ObjectId(req.params.id) } })
            })
            .then(function (dbArticle) {
                // posts deletion success message.
                res.json("Note Deleted.");
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    // Route for saving articles.
    app.post("/articles/saved/:id", function (req, res) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    // Route for removing articles from the saved list by setting the saved boolean to false.
    app.post("/articles/deleted/:id", function (req, res) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
            .then(function () {
                db.Article.findOneAndUpdate({ _id: req.params.id }, { "$set": { "note": [] } })
                    .then(function (dbArticle) {
                        res.json(dbArticle);
                    })
                    .catch(function (err) {
                        res.json(err);
                    });
            });
    });
}