#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
//var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var User = require('./models/user')
var Data = require('./models/data')
var Sensor = require('./models/sensor')


var mongoose = require('mongoose');
var mongoDB = "mongodb+srv://Chen-Yu:finalproject@cluster0.kvowd.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var datas = []
var sensors = []

function sensorCreate(name, description, cb) {
  sensordetail = {user: "62934d83e6b7363410fdf54f" , name: name, description: description};
  var sensor = new Sensor(sensordetail);
  sensor.save(function (err) {
  if (err) {
      cb(err, null)
      return
  }
  console.log('New Sensor: ' + sensor);
  sensors.push(sensor)
  cb(null, sensor)
  });
}

function dataCreate(data, year, month, day, time, cb) {
  datadetail = {user: "6297543ea294fa48b06a8d89" ,sensor:"629c854276d53007e4a66116" ,data: data, year: year, month: month, day: day, time: time};
  var data = new Data(datadetail);
  data.save(function (err) {
  if (err) {
      cb(err, null)
      return
  }
  console.log('New Data: ' + data);
  datas.push(data)
  cb(null, data)
  });
}

function userCreate(username, password, cb) {
  userdetail = {username: username, password: password};
  var user = new User(userdetail);
  user.save(function (err) {
  if (err) {
      cb(err, null)
      return
  }
  console.log('New User: ' + user);
  users.push(user)
  cb(null, user)
  });
}

// -----------------------------------------------------------------------------------

function createSensor(cb){
  async.series([
    function(callback){
      sensorCreate('Sensor1', 'This can detect people\'s respiration rate by thermal camera.', callback);
    },
    function(callback){
      sensorCreate('Sensor2', 'description here', callback);
    },
    function(callback){
      sensorCreate('Sensor3', 'description here', callback);
    }
  ],
  cb);
}

function createData(cb){
  async.parallel([
    function(callback){
      dataCreate(15, '2022', '06', '05', '15:31:20', callback);
    },
    function(callback){
      dataCreate(12, '2022', '06', '05', '15:31:30', callback);
    },
    function(callback){
      dataCreate(14, '2022', '06', '05', '15:32:20', callback);
    },
    function(callback){
      dataCreate(15, '2022', '06', '06', '12:25:20', callback);
    },
    function(callback){
      dataCreate(15, '2022', '06', '06', '15:31:20', callback);
    },
    function(callback){
      dataCreate(18, '2022', '06', '06', '15:31:30', callback);
    },
    function(callback){
      dataCreate(20, '2022', '06', '06', '15:33:20', callback);
    },
    function(callback){
      dataCreate(25, '2022', '06', '06', '15:40:20', callback);
    },
    function(callback){
      dataCreate(27, '2022', '06', '06', '16:20:00', callback);
    },
    function(callback){
      dataCreate(15, '2022', '06', '07', '15:31:20', callback);
    },
    function(callback){
      dataCreate(20, '2022', '06', '07', '15:32:20', callback);
    },
    function(callback){
      dataCreate(21, '2022', '06', '07', '15:33:20', callback);
    },
    function(callback){
      dataCreate(16, '2022', '06', '07', '16:31:20', callback);
    },
    function(callback){
      dataCreate(25, '2022', '06', '07', '17:00:20', callback);
    },
    function(callback){
      dataCreate(15, '2022', '06', '07', '17:31:20', callback);
    },
    function(callback){
      dataCreate(70, '2022', '07', '01', '15:31:20', callback);
    }
  ],
  cb);
}

function createUser(cb){
  async.series([
    function(callback){
    userCreate('test', 'test', callback);
    }
  ],
  cb);
}


async.series([  
    createData
    //createSensor
    //createUser
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        //console.log('BOOKInstances: '+bookinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});