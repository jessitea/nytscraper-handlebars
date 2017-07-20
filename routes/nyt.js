// Dependencies
var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

// creating router
var router = express.Router();

  // Route to logout
  router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/users/login");
  });

// Route to render the signUp page
  router.get("/users", function(req, res) {
    res.render("signUp");
  });

// Route to render the signIn page
  router.get("/users/login", function(req, res) {
    res.render("signIn");
  });

// Route to create a new user
  router.post("/users", function(req, res) {
      db.User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }).then(function(data){
        console.log(data.dataValues.id);

        res.redirect(303, "/users/login");
      }).catch(function(err){
        res.status(422).json(err.errors[0].message);
      });
  });

// Post request to handle login after entering username and pw
router.post("/users/main", passport.authenticate("local"), function(req, res){
    res.redirect(303, "/users/main");
  });

// Route to render the homepage with a specific users information from the different tables
  router.get("/users/main", isAuthenticated, function(req, res) {
    db.User.findOne({
      include: [{model: db.Appointment}, {model:db.ToDo}, {model: db.MedNotes}],
    where: {
      id: req.user.id
    }
    }).then(function(data) {   
        var cleanData = JSON.parse(JSON.stringify(data));
        console.log(cleanData)
     res.render("index", {user: data});
    });
  });


// APPOINTMENT ROUTES
 // Post request to create a new appointment
  router.post("/appointments", isAuthenticated, function(req, res) {
    db.Appointment.create({
      UserId: req.user.id,
      date: req.body.date,
      time: req.body.time,
      category: req.body.category,
      location: req.body.location,
      title: req.body.title,
      notes: req.body.notes
    }).then(function(data){
      res.redirect("back");
    });
  });

// Put request to update the page when the doctor info changes
  router.put("/appointments/:id", isAuthenticated, function(req, res) {
    db.Appointment.update({
      date: req.body.date,
      time: req.body.time,
      category: req.body.category,
      location: req.body.location,
      title: req.body.title,
      notes: req.body.notes
    }, {
      where: {
        id: req.params.id
      }
    }).then(function(data) {
        res.redirect("back");
    });
  });    

// Delete request to delete an appointment
  router.delete("/appointment/:id", isAuthenticated, function(req, res) {
    db.Appointment.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(data) {
        console.log(data);
        res.redirect("back");
    }).catch(function(err){
        console.log(err);
    }); 
  });


// TODO ROUTES
// Post request to add a new to do item to the list of to do items
  router.post("/todo", isAuthenticated, function(req, res) {
    db.ToDo.create({
      UserId: req.user.id,
      toDo: req.body.toDo
      
    }).then(function(data){
        console.log(data);

      res.redirect('back');
    });
  });

// Put request to update the page when the to do item changes
  router.put("/todo/:id", isAuthenticated, function(req, res) {
    db.ToDo.update({
      toDo: req.body.toDo
    }, {
      where: 
      {
        id: req.params.id 
      }
    }).then(function(data) {
      var cleanData = JSON.parse(JSON.stringify(data));
        console.log("CLEAN DATA:" + cleanData);
      var object = {
          modal: data
        }
        res.redirect('back');
    });
  });  

// Delete request to delete a to do item
  router.delete("/todo/:id", isAuthenticated, function(req, res) {
    db.ToDo.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(data) {

        res.redirect('back');
    });     
  });



// MEDICAL NOTES ROUTES
// Post request to add a new to do item to the list of medical notes
  router.post("/medicalNotes", isAuthenticated, function(req, res) {
    db.MedNotes.create({
      UserId: req.user.id,
      title: req.body.title,
      location: req.body.location,
      content: req.body.content,
      category: req.body.category

    }).then(function(data){
      res.redirect("back");
    });
  });

// Put request to update the page when the medical notes info changes
  router.put("/medicalNotes/:id", isAuthenticated, function(req, res) {
    db.MedNotes.update({
      title: req.body.title,
      location: req.body.location,
      content: req.body.content,
      category: req.body.category
    }, 
    {
      where: {
        id: req.params.id
      }
    }).then(function(data) {
        res.redirect("back");
    });
  });

// Delete route to delete a medical note
  router.delete("/medicalNotes/:id", function(req, res) {
    db.MedNotes.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(data) {
        res.redirect("back");
    }); 
  });    

//DOCTORS

 // get request to show the index.handlebars on the page 
  router.get("/users/doctors", isAuthenticated, function(req, res) {
    db.User.findOne({
        include: [{model: db.Doctor}],
      where: {
        id: req.user.id
      }
      }).then(function(data) {
          var cleanData = JSON.parse(JSON.stringify(data));
          console.log(cleanData)
       res.render("doctors", {user: data});
      });
  });

// Post request to add a new to do item to the list of doctors
  router.post("/users/doctors", isAuthenticated, function(req, res) {
      db.Doctor.create({
        UserId: req.user.id,
        name: req.body.name,
        phone: req.body.phone,
        specialty: req.body.specialty,
        location: req.body.location,
        notes: req.body.notes
      }).then(function(data){
        res.redirect("back");
      });
  });

// Put request to update the page when the doctor info changes
  router.put("/users/doctors/:id", isAuthenticated, function(req, res) {
      db.Doctor.update({
        name: req.body.name,
        phone: req.body.phone,
        specialty: req.body.specialty,
        location: req.body.location,
        notes: req.body.notes
      }, {
        where: {
          id: req.params.id
        }
      }).then(function(data) {
          res.redirect("back");
      });
    });  

// Delete request to delete a doctor
  router.delete("/users/doctors/:id", isAuthenticated, function(req, res) {
      db.Doctor.destroy({
        where: {
          id: req.params.id
        }
      }).then(function(data) {
          res.redirect("back");
      });
  });     

// export routers
module.exports = router;