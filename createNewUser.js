
//Lets load the mongoose module in our program
var mongoose = require('mongoose');

//Lets connect to our database using the DB server URL.
mongoose.connect('mongodb://localhost:27017/server_naturis');

// if our user.js file is at app/models/user.js
var User = require('./models/user');
  
// create a new user called Chenya
var chenya = new User({
  userName: 'Chenya',
  email: 'chenya@gmail.com',
  password: 'Chenya'
});

// call the custom method. hash the password
chenya.saltHashPassword(function(err, passwordHash, salt) {
  if (err) {
  	console.log('chenya.saltHashPassword: ' + err);
  } else {
  	console.log('Your hashed password is ' + passwordHash + '. Your salt is ' + salt);
  }
});

// call the built-in save method to save to the database
chenya.save(function(err) {
  if (err) {
  	console.log('chenya.save: ' + err);
  } else {
    console.log('User saved successfully!');
  }
});