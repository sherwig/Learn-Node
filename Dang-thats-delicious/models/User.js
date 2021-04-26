const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('password-local-mongoose');

const userSchema = new Scheme({
  email: {
    type: string,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: "Please supply an Email Address"
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  }
});

//To store a has of the password 
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

//For better erros
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);