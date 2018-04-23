var express = require('express');
let db = require('../modules/db')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('index')
  db.get().db('photofeed').collection('photographers').find().toArray( (error, result) => {
    console.log('result', result)
    if(error || result == null) { console.log(error) }
    else { res.json({result: result}) }
  });
});

module.exports = router;
