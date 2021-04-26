const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', {
    title: 'Login'
  });
};

exports.registerForm = (req, res) => {
  res.render('register', {
    title: "Register"
  });
};

exports.validateRegister = (req, res, next) => {
  //From app.js applies validations to requests
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'That Email is not Valid').isEmail();


};