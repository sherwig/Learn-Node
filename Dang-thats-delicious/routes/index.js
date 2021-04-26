const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');

const {
  catchErrors
} = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);


//Have to wrap this in catchErrors because our store controller is async await
router.post('/add', storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore));
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));

// the ':' is how you can dynamically change what ID you are requesting
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

//Validate the registration data
//register the user
//Actually log them in
router.post('/register', userController.validateRegister);



module.exports = router;