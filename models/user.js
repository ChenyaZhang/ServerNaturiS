
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Require the crypto module for password hash
'use strict';
var crypto = require('crypto');

// create generalFeedbackSchema
var GeneralFeedback = new Schema({
    problemSolution: { type: String },
    customerFeedback: { type: String }
});
// create specificQuestionSchema
var SpecificQuestion = new Schema({
    totalSale: { type: String },
    totalSampling: { type: String },
    mostPopular: { type: String },
    leastPopular: { type: String },
    receipts: { type: String }
});
// create specificQuestionPhotoSchema
var SpecificQuestionPhoto = new Schema({
    photo1: {type: String},
    photo2: {type: String},
    photo3: {type: String},
    photo4: {type: String}
});
// create ourProductSchema
var OurProduct = new Schema({
    firstObservation: { type: String },
    secondObservation: { type: String },
    thirdObservation: { type: String },
    lemonQ: { type: String },
    bananaQ: { type: String },
    peachQ: { type: String },
    bBerryQ: { type: String },
    sBerryQ: { type: String },
    cherryQ: { type: String },
    vanillaQ: { type: String },
    honeyQ: { type: String },
    plainQ: { type: String }
});
// create ourProductPhotoSchema
var OurProductPhoto = new Schema({
    photo1: {type: String},
    photo2: {type: String},
    photo3: {type: String},
    photo4: {type: String}
});
// create competitorProductSchema
var CompetitorProduct = new Schema({
    firstObservation: { type: String },
    secondObservation: { type: String },
    thirdObservation: { type: String },
    brandName: { type: String },
    productCategory: { type: String }
});
// create competitorProductPhotoSchema
var CompetitorProductPhoto = new Schema({
    photo1: {type: String},
    photo2: {type: String},
    photo3: {type: String},
    photo4: {type: String}
});
// create UserSchema
var UserSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    currentDemo: { type: String },
    nextDemo: { type: String },
    startTime: { type: String },
    startLocation: { type: String },
    arriveTime: { type: String },
    arriveLocation: { type: String },
    leaveTime: { type: String },
    leaveLocation: { type: String },
    competitorProduct: [CompetitorProduct],
    competitorProductPhoto: [CompetitorProductPhoto],
    ourProduct: [OurProduct],
    ourProductPhoto: [OurProductPhoto],
    specificQuestion: [SpecificQuestion],
    specificQuestionPhoto:[SpecificQuestionPhoto],
    generalFeedback: [GeneralFeedback],
    created_at: Date,
    updated_at: Date
});

// add a schema method
/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
// var genRandomString = function(length){
//     return crypto.randomBytes(Math.ceil(length/2))
//             .toString('hex') /** convert to hexadecimal format */
//             .slice(0,length);   /** return required number of characters */
// };
/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
// var sha512 = function(password, salt){
//     var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
//     hash.update(password);
//     var value = hash.digest('hex');
//     return {
//         salt:salt,
//         passwordHash:value
//     };
// };
/**
 * a function that will use the above function 
 * to generate the hash that should be stored 
 * in the database as user’s password.
 */
// UserSchema.methods.saltHashPassword = function(callback) { // <-- Add callback param
//     var salt = genRandomString(16); /** Gives us salt of length 16 */
//     var passwordData = sha512(this.password, salt);

//     console.log('UserPassword = '+ this.password);
//     console.log('Passwordhash = '+ passwordData.passwordHash);
//     console.log('\nSalt = '+ passwordData.salt);

//     this.password = passwordData.passwordHash;
//     this.salt = passwordData.salt;
    
//     // Your function that you passed in is called here
//     callback(null, passwordData.passwordHash, passwordData.salt);  
// }

// on every save, add the date
UserSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;
