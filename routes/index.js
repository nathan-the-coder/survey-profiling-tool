var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index');
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('pages/login');
});

/* GET survey pages. */
router.get('/survey', function(req, res, next) {
  res.render('pages/survey');
});

router.get('/survey2', function(req, res, next) {
  res.render('pages/survey2');
});

router.get('/survey4', function(req, res, next) {
  res.render('pages/survey4');
});

router.get('/survey5', function(req, res, next) {
  res.render('pages/survey5');
});

router.get('/final', function(req, res, next) {
  res.render('pages/final');
});

/* GET user page. */
router.get('/user', function(req, res, next) {
  res.render('pages/user');
});

/* GET archdiocese page. */
router.get('/archdiocese', function(req, res, next) {
  res.render('pages/archdiocese');
});

/* GET admin page. */
router.get('/admin', function(req, res, next) {
  res.render('pages/admin');
});

module.exports = router;
