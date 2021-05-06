const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name.'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'Please provide coordinates'
    }],
    address: {
      type: String,
      required: 'Please provide an address.'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //Skip it
    return; //Stop this function from running
  }
  this.slug = slug(this.name);
  //Find other stores that have same names and add a -1 -2 to end of the slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');

  //Actually find all of the stores with this slug by calling witht he contructor
  const storesWithSlug = await this.constructor.find({
    slug: slugRegEx
  });

  //Set the slug to slug-length+1
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length+1}`
  }

  next();
});

//Have to use a proper function or else you can't use 'this' inside of it
//Adding a custom function to our Store object
storeSchema.statics.getTagsList = function() {

  return this.aggregate([{
      $unwind: '$tags'
    }, {
      $group: {
        _id: '$tags',
        count: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    }
  ]);
}
module.exports = mongoose.model('Store', storeSchema);
