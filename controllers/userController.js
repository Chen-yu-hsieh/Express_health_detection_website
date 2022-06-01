var User = require('../models/user');
var Data = require('../models/data');
var Sensor = require('../models/sensor');
var async = require('async');
var passport = require('passport');
var bcrypt = require('bcrypt')
const { body,validationResult } = require("express-validator");
const user = require('../models/user');

exports.user_login_get = function(req, res, next){
    if(req.isAuthenticated()){
        var user_home_url = '/user/' + req.body.username;
        res.redirect(user_home_url);
    }
    else{
        res.render('login');
    }
};

exports.user_login_post =  [
    passport.authenticate('local', {
      failureRedirect: '/login'
}),
    function(req, res){
        var user_home_url = '/user/' + req.body.username;
        res.redirect(user_home_url);
    }
];

exports.user_logout = function(req, res) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid')
      res.redirect('/login')
    })}

exports.user_signup_get = function(req, res) {
    res.render('signup');
}

exports.user_signup_post = [
    // Validate and sanitize fields.
    body('username').trim().isLength({ max: 15, min: 1 }).escape().withMessage('username must contain 1 to 15 characters')
        .isAlphanumeric().withMessage('username has non-alphanumeric characters.'),
    body('password').trim().isLength({ max: 12, min: 6 }).escape().withMessage('password must contain 6 to 12 letters or numbers')
        .isAlphanumeric().withMessage('password has non-alphanumeric characters.'),
    body('phone').trim().isLength({ max: 10, min: 10 }).escape().isNumeric().withMessage('phone number is incorrect'),
    body('age').trim().escape().isNumeric().withMessage('Age must be integer.'),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var user = new User({
            username : req.body.username,
            password : bcrypt.hashSync(req.body.password,10),
            email : req.body.email,
            phone : req.body.phone,
            age : req.body.age
        })

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('signup', {user: user, errors: errors.array() });
            return;
        }
        else if(req.body.password !== req.body.pd_confirm){
            res.render('signup', {user: user, messages: "Password is not the same." });
        }
        else {
            // Data from form is valid.

            // Save author.
            user.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect('/user/' + user.username);
            });
        }
    }
]

exports.user_home_get = function(req, res, next){
    async.parallel({
        sensors: function(callback) {
            Sensor.find({'user': req.user._id})
            .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.locals.name = req.user.username;
        res.render('user_home', {user_sensors: results.sensors});
    });
}

exports.user_data_get = function(req, res, next){    
    async.parallel({
        datas: function(callback) {
            Data.find({'sensor': req.params.sensor_id})
            .exec(callback)
        },
        sensors: function(callback) {
            Sensor.find({'user': req.user._id})
            .exec(callback)
        },
        sensor: function(callback) {
            Sensor.findById(req.params.sensor_id)
            .exec(callback)
        }
    }, function(err, results) {
        if (err) {
            var err = new Error('404 not found');
            err.status = 404;
            return next(err);
        }
        res.locals.name = req.user.username;
        res.render('user_data', {user_datas: results.datas, user_sensors: results.sensors, sensor: results.sensor});
    });
}

exports.sensor_create_get = function(req, res, next){
    async.parallel({
        sensors: function(callback) {
            Sensor.find({'user': req.user._id})
            .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.locals.name = req.user.username;
        res.render('sensor_form', {user_sensors: results.sensors});
    });
}

exports.user_profile_get = function(req, res, next){
    async.parallel({
        user: function(callback) {
            User.findById(req.user._id)
            .exec(callback)
        },
        sensors: function(callback) {
            Sensor.find({'user': req.user._id})
            .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.locals.name = req.user.username;
        res.render('user_profile', {user: results.user, user_sensors: results.sensors});
    });
}

exports.sensor_create_post = [
    // Validate and sanitize fields.
    body('sensor_name').trim().isLength({ max: 30, min: 1 }).escape().withMessage('sensor name must contain 1 to 30 characters'),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var sensor = new Sensor({
            user : req.user._id,
            name : req.body.sensor_name,
            description : req.body.description
        })

        if (!errors.isEmpty()) {
            async.parallel({
                sensors: function(callback) {
                    Sensor.find({'user': req.user._id})
                    .exec(callback)
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.locals.name = req.user.username;
                res.render('sensor_form', {sensor: sensor, user_sensors: results.sensors, errors: errors.array()});
            });
        }
        else {
            sensor.save(function (err) {
                if (err) { return next(err); }
                res.redirect('/user/' + req.user.username + '/' + sensor._id);
            });
        }
    }
]