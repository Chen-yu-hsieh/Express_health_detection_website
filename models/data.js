var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DataSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId , ref: 'User', required: true},
    sensor: {type: Schema.Types.ObjectId , ref: 'Senosr', required: true},
    data : {type: Number},
    date : {type: String},
    time : {type: String}
  }
);

//Export model
module.exports = mongoose.model('Data', DataSchema);