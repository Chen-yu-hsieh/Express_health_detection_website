var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt')
var User = require('../models/user');

var user_controller = require('../controllers/userController');

passport.use(new LocalStrategy({
  passReqToCallback: true
  },
  function(req, username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      const isValidPassword = (user, password) => {
        bcrypt.hashSync(password,10);
        return bcrypt.compareSync(password, user.password);
      }

      if (err) { return done(err); }
      if (!user) {
        return done(null, false, req.flash('err_login', 'Incorrect username or password.'));
      }
      if(!isValidPassword(user, password)){
        return done(null, false, req.flash('err_login', 'Incorrect username or password.'));
      }
      return done(null, user);
    })
  }
));

passport.serializeUser(function (user, done) {
   done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    return done(err, user);
  });
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

function ensureUser(req, res, next){
  if(req.params.username === req.user.username){
    return next();
  }
  else{
    res.redirect('/user/' + req.user.username);
  }

}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/// USER ROUTES ///
router.get('/login', user_controller.user_login_get);

router.post('/login', user_controller.user_login_post);

router.get('/logout', user_controller.user_logout);

router.get('/signup', user_controller.user_signup_get);

router.post('/signup', user_controller.user_signup_post);

router.get('/user/:username', ensureAuthenticated, ensureUser, user_controller.user_home_get);

router.get('/user/:username/create', ensureAuthenticated, ensureUser, user_controller.sensor_create_get);

router.post('/user/:username/create', ensureAuthenticated, ensureUser, user_controller.sensor_create_post);

router.get('/user/:username/profile', ensureAuthenticated, ensureUser, user_controller.user_profile_get);

router.get('/user/:username/:sensor_id', ensureAuthenticated, ensureUser, user_controller.user_data_get);


module.exports = router;
