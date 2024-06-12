var express = require('express');

const { createConnection } = require("../database/dbConnect");
var router = express.Router();


/* GET home page. */
router.get('/', async function(req, res, next) {
  let jsonResp = { title: 'CMS Application' };
  if(req.query.error){
    jsonResp.error = req.query.error;
  }
  res.render('login', jsonResp);
});

/* Login */
router.post('/authenticate', async function(req, res, next) {
  console.log("reqBody::"+JSON.stringify(req.body))
  let reqBody = req.body;
  let username = reqBody.username;
  let password = reqBody.password;

  let connection = await createConnection();
  let sqlQuery = `SELECT * FROM USER WHERE username='${username}' AND PASSWORD='${password}'`
  connection.query(sqlQuery, function (err, result, fields) {
    if (err) {
      res.render('login', { title: 'CMS Application', error: error });
    };
    if(result.length == 1){
      req.session.user = result[0]
      global.userSession = result[0];
      res.redirect('/dashboard');
    }else{
      res.redirect(`/?error=Invalid Credentials`);
    }
    console.log(result);
  });
});

router.get('/dashboard', function(req, res, next) {
  
  res.render('dashboard/userDashboard', { title: 'Dashboard', session: global.userSession });

});

router.get('/channel', function(req, res, next) {
  res.render('user/channel', { title: 'Channel' , session: global.userSession});

});

router.get('/network', function(req, res, next) {
  res.render('user/network', { title: 'Network', session: global.userSession });

});

router.get('/campaign', function(req, res, next) {
  res.render('user/compaign', { title: 'Compaign', session: global.userSession });

});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard/userDashboard', { title: 'Dashboard' , session: global.userSession});

});

router.get('/user', function(req, res, next) {
  console.log(JSON.stringify(global.userSession));
  res.render('admin/user', { title: 'User Management', session: global.userSession });

});

router.get('/client', function(req, res, next) {
  console.log(JSON.stringify(global.userSession));
  res.render('admin/client', { title: 'Client Management', session: global.userSession });

});

router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.redirect('/')

});


module.exports = router;
