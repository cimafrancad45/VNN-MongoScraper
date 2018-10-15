// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page

  $("#articles").append("<div class='card article-card'>" + 
  "<div='card-body'>" +
  "<h5 class='card-title'>" + data[i].title + "</h5>" + 
  "<a class='btn btn-primary' href='" + data[i].link + "'>Go to Article</a> " +
  "<a class='btn btn-primary comment-btn' href='#'  data-id='" + data[i]._id + "'>Comment</a>"
  + "</div>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".comment-btn", function() {
  // Empty the notes from the note section
  console.log("Hey!")
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId)
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // card with input data for comment
      $("#notes").append("<div class= 'card'><h2 class = 'card-header'>" + data.title + "</h2>" +
      "<div class='form-group card-body text-center'><input class ='form-control' id='titleinput' name='title' placeholder='Comment title'>" + 
      "<br><textarea class='form-control' id='bodyinput' name='body' placeholder='Enter comment here.'></textarea><br>" +
      "<button class = 'btn-primary btn text center' data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
