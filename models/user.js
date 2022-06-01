var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: { type: String, max:15, min:1, required: true },
    password:{ type: String, max:12, min:6, required: true},
    email:{ type: String, required: true},
    phone:{ type: String, required: true},
    age:{ type: Number, required: true}
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);