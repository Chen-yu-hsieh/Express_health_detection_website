var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DataSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId , ref: 'User', required: true},
    sensor: {type: Schema.Types.ObjectId , ref: 'Senosr', required: true},
    data : {type: Number, required: true},
    year :{type: String, required: true},
    month : {type: String, required: true},
    day :{type: String, required: true},
    time : {type: String, required: true}
  }
);

DataSchema
.virtual('date')
.get(function () {
  return this.year + '-' + this.month + '-' + this.day;
});

//Export model
module.exports = mongoose.model('Data', DataSchema);