var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

/* GET survey pages. */
router.get('/survey', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/survey.html'));
});

router.get('/survey2', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/survey2.html'));
});

router.get('/survey4', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/survey4.html'));
});

router.get('/survey5', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/survey5.html'));
});

router.get('/final', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/final.html'));
});

/* GET user page. */
router.get('/user', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/user.html'));
});

/* GET archdiocese page. */
router.get('/archdiocese', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/archdiocese.html'));
});

module.exports = router;
