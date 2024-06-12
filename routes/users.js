var express = require('express');
const { createConnection } = require("../database/dbConnect");
var router = express.Router();

router.get('/get', async function(req, res, next) {
  let connection = await createConnection();
  let selectQuery = `Select * from user`;
  connection.query(selectQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, users: result});
  });
  
});

router.get('/getClients', async function(req, res, next) {
  let connection = await createConnection();
  let selectQuery = `Select * from client`;
  connection.query(selectQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, users: result});
  });
  
});

let validateuser = async (user) => {
  if(user.name == undefined || user.name == null || user.name == ''){
    return false;
  }else if(user.userType == undefined || user.userType == null || user.userType == ''){
    return false;
  }else if(user.username == undefined || user.username == null || user.username == ''){
    return false;
  }else if(user.password == undefined || user.password == null || user.password == ''){
    return false;
  }else{
    return true;
  }
}

router.post('/add', async function(req, res, next) {
  let connection = await createConnection();
  let user = req.body;
  let validateData = await validateuser(user);
  console.log(validateData);
  if(validateData){
    let insertQuery = `INSERT INTO user(name, userType, username, password) values ('${user.name}', '${user.userType}', '${user.username}', '${user.password}')`;
    connection.query(insertQuery, function (err, result, fields) {
      if (err) {
        console.log(err.sqlMessage);
        if(err.sqlMessage.includes('Duplicate entry')){
          res.status(400).send('Username already exists');
        }else{
          res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
        }
      }else{
        res.status(200).json({ status: 200, message: 'User Added Succussfully'});
      }
    });
  }else{
    res.status(400).send('Please enter valid data to add User');
  }
  
});

module.exports = router;
