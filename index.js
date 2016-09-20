
// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');         // Lets load the mongoose module in our program
var multiparty = require('multiparty');
var fs = require('fs');

var User = require('./models/user'); // if our user.js file is at app/models/user.js

//Lets connect to our database using the DB server URL.
mongoose.connect('mongodb://Baobao:bibibi@ec2-54-163-207-173.compute-1.amazonaws.com:27017/brandEasy');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port


// ROUTES FOR OUR API
// =============================================================================

var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

    // create a user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {

        var user = new User();      // create a new instance of the User model
        user.userName = req.body.userName;  // set the user name (comes from the request)
        user.email = req.body.email;
        user.password = req.body.password;
        user.currentDemo = req.body.currentDemo;
        user.nextDemo = req.body.nextDemo;
        // user.saltHashPassword(function(err, passwordHash, salt) {
        // 	user.password = passwordHash;
        // });
        // user.saltHashPassword(function(err, passwordHash, salt) {
        // 	user.salt = salt;
        // });

        // save the user and check for errors
        user.save(function(err) {
            if (err)
                return res.send(err);

            return res.json({ message: 'User created!' });
        });
        
    })

    // get all the users (accessed at GET http://localhost:8080/api/users)
    // .get(function(req, res) {
    //     User.find(function(err, users) {
    //         if (err)
    //             res.send(err);

    //         res.json(users);
    //     });
    // });

// on routes that end in /users/userName/:userName
// ----------------------------------------------------
router.route('/users/userName/:userName')

    // get the user with that userName (accessed at GET http://localhost:8080/api/users/:userName)
    .get(function(req, res) {
        User.findOne({ userName: req.params.userName}, function(err, user) {
            if (err)
                return res.send(err);

            return res.json(user);
        });
    })

    // update the user with this userName (accessed at PUT http://localhost:8080/api/users/:userName)
    .put(function(req, res) {

        // use our user model to find the user we want
        User.findOne({ userName: req.params.userName}, function(err, user) {

            if (err)
                res.send(err);

            if (req.body.startTime != null) {
                user.startTime = req.body.startTime;  // update the user info
            }
            if (req.body.startLocation != null) {
                user.startLocation = req.body.startLocation;  // update the user info
            }
            if (req.body.arriveTime != null) {
                user.arriveTime = req.body.arriveTime;  // update the user info
            }
            if (req.body.arriveLocation != null) {
                user.arriveLocation = req.body.arriveLocation;  // update the user info
            }
            if (req.body.leaveTime != null) {
                user.leaveTime = req.body.leaveTime;  // update the user info
            }
            if (req.body.leaveLocation != null) {
                user.leaveLocation = req.body.leaveLocation;  // update the user info
            }

            // save the user
            user.save(function(err) {
                if (err)
                    return res.send(err);

                return res.json({ message: 'User updated!' });
            });

        });
    })

    // delete the user with this userName (accessed at DELETE http://localhost:8080/api/users/:userName)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.userName
        }, function(err, user) {
            if (err)
                return res.send(err);

            return res.json({ message: 'Successfully deleted' });
        });
    });


// on routes that end in /users/email/:email
// ----------------------------------------------------
router.route('/users/email/:email')

    // get the user with that userName (accessed at GET http://localhost:8080/api/users/email/:email)
    .get(function(req, res) {
        User.findOne({ email: req.params.email}, function(err, user) {
            if (err)
                return res.send(err);

            return res.json(user);
        });
    });


// on routes that end in /users/competitorProductTextData
// ----------------------------------------------------
router.route('/users/competitorProductTextData/:userName')

    // update the user info (accessed at PUT http://localhost:8080/api/users/competitorAnalysisTextData)
    .post(function(req, res) {

        // Just give instruction to mongodb to find document, change it;
        // then finally after mongodb is done, return the result/error as callback.
        User.findOneAndUpdate(
            { userName : req.params.userName},
            {
                $set:
                {   "competitorProduct.0.firstObservation" : req.body.firstObservation,
                    "competitorProduct.0.secondObservation" : req.body.secondObservation,
                    "competitorProduct.0.thirdObservation" : req.body.thirdObservation,
                    "competitorProduct.0.brandName" : req.body.brandName,
                    "competitorProduct.0.productCategory" : req.body.productCategory
                }
            },
            { upsert: true },
            function(err, user) {
                // after mongodb is done updating, you are receiving the updated file as callback
                // now you can send the error or updated file to client
                if (err)
                    return res.send(err);

                return res.json({ message: 'User updated!' });
            });

    })


// on routes that end in /users/competitorProductPhotoData
// ----------------------------------------------------
router.route('/users/competitorProductPhotoData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/competitorAnalysisPhotoData)
    .post(function(req, res) {

        // Parse Multipart-data form upload
        var form = new multiparty.Form();

        // Errors may be emitted
        // Note that if you are listening to 'part' events, the same error may be
        // emitted from the `form` and the `part`.
        form.on('error', function(err) {
            console.log('Error parsing form: ' + err.stack);
        });

        form.on('file', function(err, files) {
                // Upload photo to the embedded document
                if (files.originalFilename === 'photo1.png') {
                    User.findOneAndUpdate(
                        { userName : req.params.userName},
                        { $set:
                            { "competitorProductPhoto.0.photo1" : files.path }
                        },
                        { upsert : true },
                        function(err, user) {
                            // After mongodb is done updating, you are receiving the updated file as callback

                            // Now you can send the error or updated file to client
                            if (err)
                                return res.send(err);
                            return;
                        });
                } else if (files.originalFilename === 'photo2.png') {
                    User.findOneAndUpdate(
                        { userName : req.params.userName},
                        { $set:
                            { "competitorProductPhoto.0.photo2" : files.path }
                        },
                        { upsert : true },
                        function(err, user) {
                            // After mongodb is done updating, you are receiving the updated file as callback

                            // Now you can send the error or updated file to client
                            if (err)
                                return res.send(err);
                            return;
                        });
                } else if (files.originalFilename === 'photo3.png') {
                    User.findOneAndUpdate(
                        { userName : req.params.userName},
                        { $set:
                            { "competitorProductPhoto.0.photo3" : files.path }
                        },
                        { upsert : true },
                        function(err, user) {
                            // After mongodb is done updating, you are receiving the updated file as callback

                            // Now you can send the error or updated file to client
                            if (err)
                                return res.send(err);
                            return;
                        });
                } else if (files.originalFilename === 'photo4.png') {
                    User.findOneAndUpdate(
                        { userName : req.params.userName},
                        { $set:
                            { "competitorProductPhoto.0.photo4" : files.path }
                        },
                        { upsert : true },
                        function(err, user) {
                            // After mongodb is done updating, you are receiving the updated file as callback

                            // Now you can send the error or updated file to client
                            if (err)
                                return res.send(err);
                            return;
                        });
                }
        });

        // form.parse(req);
        form.parse(req);
    })

// on routes that end in /users/competitorProductTextData
// ----------------------------------------------------
router.route('/users/ourProductTextData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/ourProductTextData)
    .post(function(req, res) {

        // Just give instruction to mongodb to find document, change it;
        // then finally after mongodb is done, return the result/error as callback.
        User.findOneAndUpdate(
            { userName : req.params.userName},
            {
                $set:
                {   "ourProduct.0.firstObservation" : req.body.firstObservation,
                    "ourProduct.0.secondObservation" : req.body.secondObservation,
                    "ourProduct.0.thirdObservation" : req.body.thirdObservation,
                    "ourProduct.0.lemonQ" : req.body.lemonQ,
                    "ourProduct.0.bananaQ" : req.body.bananaQ,
                    "ourProduct.0.peachQ" : req.body.peachQ,
                    "ourProduct.0.bBerryQ" : req.body.bBerryQ,
                    "ourProduct.0.sBerryQ" : req.body.sBerryQ,
                    "ourProduct.0.cherryQ" : req.body.cherryQ,
                    "ourProduct.0.vanillaQ" : req.body.vanillaQ,
                    "ourProduct.0.honeyQ" : req.body.honeyQ,
                    "ourProduct.0.plainQ" : req.body.plainQ
                }
            },
            { upsert: true },
            function(err, user) {
                // after mongodb is done updating, you are receiving the updated file as callback
                // now you can send the error or updated file to client
                if (err)
                    return res.send(err);

                return res.json({ message: 'User updated!' });
            });

    })

// on routes that end in /users/ourProductPhotoData
// ----------------------------------------------------
router.route('/users/ourProductPhotoData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/ourProductPhotoData)
    .post(function(req, res) {

        // Parse Multipart-data form upload
        var form = new multiparty.Form();

        // Errors may be emitted
        // Note that if you are listening to 'part' events, the same error may be
        // emitted from the `form` and the `part`.
        form.on('error', function(err) {
            console.log('Error parsing form: ' + err.stack);
        });

        form.on('file', function(err, files) {
            // Upload photo to the embedded document
            if (files.originalFilename === 'photo1.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "ourProductPhoto.0.photo1" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo2.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "ourProductPhoto.0.photo2" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo3.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "ourProductPhoto.0.photo3" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo4.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "ourProductPhoto.0.photo4" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            }
        });

        // form.parse(req);
        form.parse(req);
    })

// on routes that end in /users/generalFeedbackTextData
// ----------------------------------------------------
router.route('/users/generalFeedbackTextData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/generalFeedbackTextData)
    .post(function(req, res) {

        // Just give instruction to mongodb to find document, change it;
        // then finally after mongodb is done, return the result/error as callback.
        User.findOneAndUpdate(
            { userName : req.params.userName},
            {
                $set:
                {   "generalFeedback.0.problemSolution" : req.body.problemSolution,
                    "generalFeedback.0.customerFeedback" : req.body.customerFeedback
                }
            },
            { upsert: true },
            function(err, user) {
                // after mongodb is done updating, you are receiving the updated file as callback
                // now you can send the error or updated file to client
                if (err)
                    return res.send(err);

                return res.json({ message: 'User updated!' });
            });

    })

// on routes that end in /users/specificQuestionTextData
// ----------------------------------------------------
router.route('/users/specificQuestionTextData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/specificQuestionTextData)
    .post(function(req, res) {

        // Just give instruction to mongodb to find document, change it;
        // then finally after mongodb is done, return the result/error as callback.
        User.findOneAndUpdate(
            { userName : req.params.userName},
            {
                $set:
                {   "specificQuestion.0.totalSale" : req.body.totalSale,
                    "specificQuestion.0.totalSampling" : req.body.totalSampling,
                    "specificQuestion.0.mostPopular" : req.body.mostPopular,
                    "specificQuestion.0.leastPopular" : req.body.leastPopular,
                    "specificQuestion.0.receipts" : req.body.receipts
                }
            },
            { upsert: true },
            function(err, user) {
                // after mongodb is done updating, you are receiving the updated file as callback
                // now you can send the error or updated file to client
                if (err)
                    return res.send(err);

                return res.json({ message: 'User updated!' });
            });

    })

// on routes that end in /users/specificQuestionPhotoData
// ----------------------------------------------------
router.route('/users/specificQuestionPhotoData/:userName')

// update the user info (accessed at PUT http://localhost:8080/api/users/specificQuestionPhotoData)
    .post(function(req, res) {

        // Parse Multipart-data form upload
        var form = new multiparty.Form();

        // Errors may be emitted
        // Note that if you are listening to 'part' events, the same error may be
        // emitted from the `form` and the `part`.
        form.on('error', function(err) {
            console.log('Error parsing form: ' + err.stack);
        });

        form.on('file', function(err, files) {
            // Upload photo to the embedded document
            if (files.originalFilename === 'photo1.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "specificQuestionPhoto.0.photo1" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo2.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "specificQuestionPhoto.0.photo2" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo3.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "specificQuestionPhoto.0.photo3" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            } else if (files.originalFilename === 'photo4.png') {
                User.findOneAndUpdate(
                    { userName : req.params.userName},
                    { $set:
                        { "specificQuestionPhoto.0.photo4" : files.path }
                    },
                    { upsert : true },
                    function(err, user) {
                        // After mongodb is done updating, you are receiving the updated file as callback

                        // Now you can send the error or updated file to client
                        if (err)
                            return res.send(err);
                        return;
                    });
            }
        });

        // form.parse(req);
        form.parse(req);
    })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================

app.listen(port);
console.log('Magic happens on port ' + port);




