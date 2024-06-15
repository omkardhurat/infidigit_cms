var express = require('express');
const { createConnection } = require("../database/dbConnect");
var router = express.Router();

router.get('/get', async function(req, res, next) {
  let connection = await createConnection();
  try{
    const [results] = await connection.query('SELECT * FROM user');
    console.log('Results:', results);
    res.status(200).json({ status: 200, users: results});
  }catch(error){
    console.log(error);
    res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
  }finally{
    await connection.end();
  }
  
});

router.get('/getClients', async function(req, res, next) {
  let connection = await createConnection();
  try{
    const [results] = await connection.query(`SELECT * FROM user where userType='client'`);
    console.log('Results:', results);
    res.status(200).json({ status: 200, users: results});
  }catch(error){
    console.log(error);
    res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});  
  }finally{
    await connection.end();
  }
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

    try{
      let insertQuery = `INSERT INTO user(name, userType, username, password) values ('${user.name}', '${user.userType}', '${user.username}', '${user.password}')`;
      let [result] = await connection.query(insertQuery);
      res.status(200).json({ status: 200, message: 'User Added Succussfully'});
    }catch(error){
      if(error && error.sqlMessage && error.sqlMessage.includes('Duplicate entry')){
        res.status(400).send('Username already exists');
      }else{
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
    }finally{
      await connection.end();
    }

  }else{
    res.status(400).send('Please enter valid data to add User');
  }
  
});


let validateClient = async (user) => {
  if(user.name == undefined || user.name == null || user.name == ''){
    return false;
  }else if(user.state == undefined || user.state == null || user.state == ''){
    return false;
  }else if(user.city == undefined || user.city == null || user.city == ''){
    return false;
  }else if(user.address == undefined || user.address == null || user.address == ''){
    return false;
  }else if(user.username == undefined || user.username == null || user.username == ''){
    return false;
  }else if(user.password == undefined || user.password == null || user.password == ''){
    return false;
  }else{
    return true;
  }
}

let insertUser = async (user, connection) => {
  let insertUserQry = `INSERT INTO user(name, userType, username, password) values ('${user.name}', 'client', '${user.username}', '${user.password}')`
  let userId = await connection.query(insertUserQry, function(err, result){
      if (err) {
        throw err;
      }else{
        return result;
      }
  });
  return userId;
  
}

router.post('/addClient', async function(req, res, next) {
  let connection = await createConnection();
  let user = req.body;
  let validateData = await validateClient(user);
  console.log(validateData);
  if(validateData){
    try{  
      await connection.query('START TRANSACTION');
      let insertUserQry = `INSERT INTO user(name, userType, username, password) values ('${user.name}', 'client', '${user.username}', '${user.password}')`
      // let inserUserResp = 
      await connection.query(insertUserQry);
      let lastIdQuery = `SELECT userId from user order BY userId DESC LIMIT 1`;
      let userId = await connection.query(lastIdQuery);
      console.log("JSON::"+JSON.stringify(userId[0][0]));
      userId = userId[0][0].userId;
      let insertQuery = `INSERT INTO client(name, state, city, address, userId) values ('${user.name}', ${user.state}, ${user.city}, '${user.address}', ${userId})`;
      let clientResp = await connection.query(insertQuery);

      await connection.query('COMMIT');
      res.status(200).json({ status: 200, message: 'Client Added Succussfully'});
      // let insertUserQry = `INSERT INTO user(name, userType, username, password) values ('${user.name}', 'client', '${user.username}', '${user.password}')`
      // let userId = await connection.query(insertUserQry, function(err, result){
      //     if (err) {
      //       if(err && err.sqlMessage && err.sqlMessage.includes('Duplicate entry')){
      //           res.status(400).send('Username already exists');
      //         }else{
      //           res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      //         }
      //     }else{
      //       return result;
      //     }
      // });
      // console.log(JSON.stringify(userId));
      
      // let insertQuery = `INSERT INTO user(name, state, city, address, userId, username, password) values ('${user.name}', ${user.state}, ${user.city}, '${user.address}', ${userId}, '${user.username}', '${user.password}')`;
      // connection.query(insertQuery, function (err, result, fields) {
      //   if (err) {
      //     console.log(err.sqlMessage);
      //     if(err.sqlMessage.includes('Duplicate entry')){
      //       res.status(400).send('Username already exists');
      //     }else{
      //       res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      //     }
      //   }else{
      //     res.status(200).json({ status: 200, message: 'User Added Succussfully'});
      //   }
      // });
    }catch(error){
      console.log(error);
      await connection.query('ROLLBACK');
      if(error && error.sqlMessage && error.sqlMessage.includes('Duplicate entry')){
        res.status(400).send('Username already exists');
      }else{
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
    }
  }else{
    res.status(400).send('Please enter valid data to add User');
  }
  
});

module.exports = router;
