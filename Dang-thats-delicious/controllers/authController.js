const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'Oops you need to be logged in');
  res.redirect('/login');
};

//Start of password reset flow
exports.forgot = async (req, res) => {
  //See if user exists
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }
  //set reset tokens and expiery to account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  //Gives them 1 hour to reset the password
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  //send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    subject: 'Password Reset',
    resetURL,
    fileName: 'password-reset'
  });
  req.flash('success', 'You have been emailed a password reset link.');
  //redirect them to the login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });
  if (!user) {
    req.flash('error', 'Password Reset Token is invalid or has expired');
    res.redirect('/login');
  }
  //If there is a user then show the reset password form
  res.render('reset', {
    title: 'Reset Your Password'
  });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
};

exports.update = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
      }
    });

    if (!user) {
      req.flash('error', 'Password Reset Token is invalid or has expired');
      res.redirect('/login');
    }
    //made available from plugin
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);

    //Getting rid of fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('Success', 'You have successfully updated your password');
    res.redirect('/');
};
