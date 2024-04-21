var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'CMS Application' });
});

/* Login */
router.post('/login', function(req, res, next) {
  console.log("reqBody::"+JSON.stringify(req.body))
  let reqBody = req.body;
  let username = reqBody.username;
  let password = reqBody.password;
  res.render('dashboard/userDashboard', { title: 'CMS Application' });
});

module.exports = router;
