const mongoose = require('mongoose');
const Store = mongoose.model('Store');


exports.homePage = (req, res) => {
  res.render('index');
};

//Adding a title to the add page
exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  });
};

//Sending to MONGO
exports.createStore = async (req, res) => {
  //adding elements from the form to a new Store
  const store = await (new Store(req.body)).save();
  //Sending to Mongo
  //Will not move on to here until the Promise is fulfilled
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};


exports.getStores = async (req, res) => {
  //Query the database for a list of all stores
  const stores = await Store.find();
  console.log(stores);
  res.render('stores', {
    title: 'Stores',
    stores
  });
};