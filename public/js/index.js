$(document).on("click", "button", function() {
  // Empty the notes from the note section
  // $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log('DATA' + data);
      // The title of the article
      

      // If there's a note in the article
      if (data.note) {
        var notes = data.note; 
        notes.forEach(function(notes){
          $("#existingNote").append("<p><b>" + notes.body + "</b></p>");
          $("#existingNote").append("<p>" + notes.body + "</p>");
          $("#existingNote").append("<form action='/notes/" + notes._id + "' method='get'><button type='submit' class='btn btn-primary'>Delete!</button></form");
        })
      }

    });
});