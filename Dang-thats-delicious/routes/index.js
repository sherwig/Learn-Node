const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  // console.log('oh Hey');
  const wes = {
    name: 'Wes',
    age: 100,
    cool: true
  };
  // res.json(req.query);
  //Can only send data one time
  // res.send('Hey! It works!');
  // res.send(req.query.name);

  res.render('hello', {
    name: 'sam',
    dog: req.query.dog
  })
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);

});

module.exports = router;