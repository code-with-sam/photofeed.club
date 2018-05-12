var express = require('express');
let db = require('../modules/db')

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {title: 'Feeds'})
})

router.get('/photographers', function(req, res, next) {
  res.render('photographers', {title: 'Photographers'})
})

router.get('/@:username', function(req, res, next) {
  let username = req.params.username
  res.render('profile',{username})
})

/* GET photographers. */
router.get('/photographers.json', function(req, res, next) {
  console.log('index')
  db.get().db('photofeed2').collection('photographers').find().toArray( (error, result) => {
    console.log('result', result)
    if(error || result == null) { console.log(error) }
    else { res.json({result: result}) }
  });
});

module.exports = router;
