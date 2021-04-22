const mongoose = require('mongoose');
const Store = mongoose.model('Store');
//For Images
const multer = require('multer');
//For resizing images
const jimp = require('jimp');
//Unique Identifier library to make unique image names
const uuid = require('uuid');

const multerOptions = {
  //Storing right to memory for now
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    //Checking what kind of image it is so png, jpg, jpeg
    const isPhoto = file.mimetype.startsWith('image');
    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: 'That filetype isn\'t allowed.'
      }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

//Adding a title to the add page
exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store'
  });
};

// multing to add the images
exports.upload = multer(multerOptions).single('photo');

//Resizing the images
exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next(); //Skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`
  //Now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once we have written the photo to file system keep going.
  next();
}

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
  res.render('stores', {
    title: 'Stores',
    stores
  });
};

exports.editStore = async (req, res) => {
  //Find the store given the ID
  const store = await Store.findOne({
    _id: req.params.id
  })
  //Confirm they are the owner of the store
  //TODO
  //Render out the edit form so the user can update their store
  res.render('editStore', {
    title: `Edit ${store.name}`,
    store
  });
};

exports.updateStore = async (req, res) => {
  //set the location to be a point
  req.body.location.type = 'Point';
  //Find and update the store
  const store = await Store.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true, //Will return the new store rather than the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>.<a href="/stores/${store.slug}">View Store </a>`)
  res.redirect(`/stores/${store._id}/edit`)
  //Redirect them to the store and let them know it worked.
};


exports.getStoreBySlug = async (req, res, next) => {
  //Find the store from the slug we created earlier
  const store = await Store.findOne({
    slug: req.params.slug
  });
  //if it isn't a store then move on with the next middleware in app.js
  if (!store) {
    return next();
  }
  // render the store.pug and send the title as store.name
  res.render('store', {
    store,
    title: store.name
  });
};


// exports.getStoresByTag = async (req, res) => {
//   const tag = req.params.tag;
//
//   const tagQuery = tag || {
//     $exists: true
//   };
//   const tagsPromise = Store.getTagsList();
//   const storesPromise = Store.find({
//     tags: tagQuery
//   });
//   //Wait for multiple promises to comeback as we need to get the tags and the stores
//   const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
//
//   res.render('tag', {
//     tags,
//     title: 'Tags',
//     tag,
//     stores
//   });
// };

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || {
    $exists: true,
    $ne: []
  };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({
    tags: tagQuery
  });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);


  res.render('tag', {
    tags,
    title: 'Tags',
    tag,
    stores
  });
};