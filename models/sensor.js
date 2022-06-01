var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SensorSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId , ref: 'User', required: true},
    name : {type: String, max:30, required:true},
    description : {type: String, max:200},
  }
);

// Virtual for book's URL
SensorSchema
.virtual('url')
.get(function () {
  return '/user/' + this.user.username + '/' +  this._id;
});

//Export model
module.exports = mongoose.model('Sensor', SensorSchema);