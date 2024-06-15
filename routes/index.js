var express = require('express');

const { createConnection } = require("../database/dbConnect");
const { isLoggedIn } = require('./middleware');
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

  try{
    let insertQuery = `SELECT * FROM USER WHERE username='${username}' AND PASSWORD='${password}'`;
    let [result] = await connection.query(insertQuery);
    if(result.length == 1){
      req.session.user = result[0]
      global.userSession = result[0];
      res.redirect('/dashboard');
    }else{
      res.redirect(`/?error=Invalid Credentials`);
    }
  }catch(error){
    console.log(error);
    res.redirect(`/?error=Invalid Credentials`);
  }finally{
    await connection.end();
  }

});

router.get('/dashboard', isLoggedIn, function(req, res, next) {
  
  res.render('dashboard/userDashboard', { title: 'Dashboard', session: global.userSession });

});

router.get('/channel', isLoggedIn, function(req, res, next) {
  res.render('user/channel', { title: 'Channel' , session: global.userSession});

});

router.get('/network', isLoggedIn, function(req, res, next) {
  res.render('user/network', { title: 'Network', session: global.userSession });

});

router.get('/campaign', isLoggedIn, function(req, res, next) {
  res.render('user/compaign', { title: 'Compaign', session: global.userSession });

});

router.get('/dashboard', isLoggedIn,function(req, res, next) {
  res.render('dashboard/userDashboard', { title: 'Dashboard' , session: global.userSession});

});

router.get('/user', isLoggedIn, function(req, res, next) {
  console.log(JSON.stringify(global.userSession));
  res.render('admin/user', { title: 'User Management', session: global.userSession });

});

router.get('/client', isLoggedIn, function(req, res, next) {
  console.log(JSON.stringify(global.userSession));
  res.render('admin/client', { title: 'Client Management', session: global.userSession });

});

router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.redirect('/')

});


module.exports = router;
