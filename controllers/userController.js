var User = require('../models/user');
var Data = require('../models/data');
var Sensor = require('../models/sensor');
var async = require('async');
var passport = require('passport');
var bcrypt = require('bcrypt')
const { body,validationResult } = require("express-validator");
const user = require('../models/user');

function days_in_month(year, month){
    switch(month){
        case 1: return 31;
        case 2: {
            if( year%400 == 0 || ( year%4 == 0 && year % 100!=0 ))
                return 29;
            else
                return 28;
        }
        case 3: return 31;
        case 4: return 30;
        case 5: return 31;
        case 6: return 30;
        case 7: return 31;
        case 8: return 31;
        case 9: return 30;
        case 10: return 31;
        case 11: return 30;
        case 12: return 31;
        default : return 30;
    }
};

function number_stringify(number){
    if(number < 10) return '0' + String(number);
    else return  String(number);
};

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
})};

exports.user_signup_get = function(req, res) {
    res.render('signup');
};

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
            return;
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
];

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
};

exports.user_data_get = function(req, res, next){
    var month, days;
    var dayAvg = [];
    
    if(!req.query.month || isNaN(req.query.month)){
        var today = new Date();
        month = today.getMonth() + 1;
    }
    else{
        month = Number(req.query.month);
    }
    days = days_in_month(month);
    month = number_stringify(month);

    function render(){
        async.parallel({
            allData: function(callback) {
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
            res.render('user_data', {
                allData: results.allData, 
                dayAvg: dayAvg,
                days: days,
                month: month,
                user_sensors: results.sensors,
                sensor: results.sensor  
            });
        })
    };

    async.times(
        days,
        function(count, callback){
            Data.find({'month': month, 'day': number_stringify(count+1)}, "data")
            .exec(callback)
        },
        function(err, results){
            if(err){
                var err = new Error('404 not found');
                err.status = 404;
                return next(err);
            }
            else {
                // Calculate daily average resp. rate
                for(let i=0;i<days;i++){
                    var sum = 0;
                    len = Object.keys(results[i]).length;
                    if(len != 0){
                        Object.keys(results[i]).forEach(key => {
                            sum += results[i][key].data;
                        });
                        dayAvg[i] = sum / len;
                    }
                    else dayAvg[i] = 0;
                };
                render();
            }
        }
    );
};

exports.user_data_post = [
    body('user').trim().escape(),
    body('sensor').trim().escape(),
    body('data').trim().escape().isNumeric().withMessage('Invalid value in data'),
    body('year').trim().isLength({min:4, max:4}).escape().withMessage('Invalid format in year(yyyy)'),
    body('month').trim().isLength({min:2, max:2}).escape().withMessage('Invalid format in month(mm)'),
    body('day').trim().isLength({min:2, max:2}).escape().withMessage('Invalid format in day(dd)'),
    body('time').trim().isLength({min:8, max:8}).escape().withMessage('Invalid format in time(hh:mm:ss)'),

    (req, res, next) => {
        const errors = validationResult(req);

        async.parallel({
            user: function(callback) {
                User.findById(req.body.user)
                .exec(callback)
            },
            sensor: function(callback){
                Sensor.find({'user': req.body.user, 'name': req.body.sensor})
                .exec(callback)
            }
        }, function(err, results) {
            if (err) { return next(err); }

            if(!results.user) res.send("Can not find user");         
            else if(!results.sensor) res.send("Can not find sensor");
            
        });

        if(!errors.isEmpty()){
            var msg = [];
            error = errors.array();
            error.forEach(item => msg.push(item['msg']));
            res.send(msg);
        }
        else{
            var data = new Data({
                user : req.body.user,
                sensor : req.body.sensor,
                data : req.body.data,
                year : req.body.year,
                month : req.body.month,
                day : req.body.day,
                time : req.body.time
            });

            data.save(function(err){
                if(err) return next(err);
                else res.sendStatus(200);
            });
        }
    }
];



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
};

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
};

exports.sensor_create_post = [
    body('sensor_name').trim().isLength({ max: 30, min: 1 }).escape().withMessage('sensor name must contain 1 to 30 characters'),

    (req, res, next) => {
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
                res.render('sensor_form', {sensor: sensor,
                    user_sensors: results.sensors,
                    errors: errors.array()
                });
            });
        }
        else {
            sensor.save(function (err) {
                if (err) { return next(err); }
                res.redirect('/user/' + req.user.username + '/' + sensor._id);
            });
        }
    }
];