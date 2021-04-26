const mongoose = require('mongoose');

// import environmental variables from our variables.env file
require('dotenv').config({
  path: 'variables.env'
});

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
// mongoose.connect(process.env.MONGO_URI, {
//   user: process.env.DB_USER,
//   pass: process.env.DB_PASS
// });
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!

//Import all of our models for Mongo
require('./models/Store');
require('./models/User');


// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});