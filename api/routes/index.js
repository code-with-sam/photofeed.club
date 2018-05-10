var express = require('express');
let db = require('../modules/db')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index')
})

router.get('/photographers', function(req, res, next) {
  res.render('photographers')
})

router.get('/@username', function(req, res, next) {
  let username = req.params.username
  res.render('profile',{username})
})

/* GET photographers. */
router.get('/photographers.json', function(req, res, next) {
  console.log('index')
  db.get().db('photofeed').collection('photographers').find().toArray( (error, result) => {
    console.log('result', result)
    if(error || result == null) { console.log(error) }
    else { res.json({result: result}) }
  });
});

module.exports = router;
