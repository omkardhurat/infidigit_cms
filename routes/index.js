var express = require('express');

const { createConnection } = require("../database/dbConnect");
var router = express.Router();


/* GET home page. */
router.get('/', async function(req, res, next) {
  
  let connection = await createConnection();
  // A simple SELECT query
  // connection.connect(function(err) {
  //   if (err) throw err;
    connection.query("SELECT * from test", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
    });
  // });
  res.render('login', { title: 'CMS Application' });
});

/* Login */
router.post('/dashboard', function(req, res, next) {
  console.log("reqBody::"+JSON.stringify(req.body))
  let reqBody = req.body;
  let username = reqBody.username;
  let password = reqBody.password;
  res.render('dashboard/userDashboard', { title: 'CMS Application' });
});

router.get('/channel', function(req, res, next) {
  res.render('user/channel', { title: 'CMS Application' });

});

router.get('/network', function(req, res, next) {
  res.render('user/network', { title: 'CMS Application' });

});

router.get('/campaign', function(req, res, next) {
  res.render('user/compaign', { title: 'CMS Application' });

});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard/userDashboard', { title: 'CMS Application' });

});

module.exports = router;
