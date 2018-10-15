var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var SummarySchema = new Schema({
  // `title` is required and of type String
  summary: {
    type: String,
    required: true
  }
});

// This creates our model from the above schema, using mongoose's model method
var Summary = mongoose.model("Article", SummarySchema);

// Export the Article model
module.exports = Summary;
