var express = require('express');

const { createConnection } = require("../database/dbConnect");
const { isNullOrEmpty } = require('../constants/validators')
var router = express.Router();

router.get('/get', async function(req, res, next) {
    let connection = await createConnection();
    let countQuery = `SELECT CH.id, CH.name, CH.created_at, CH.updated_at, S.NAME AS state, C.NAME AS city FROM CHANNEL CH 
    INNER JOIN STATE S 
    ON S.ID = CH.STATE
    INNER JOIN CITY C
    ON C.ID = CH.CITY`
    connection.query(countQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
      res.status(200).json({ status: 200, channels: result});
    });
    
});


router.get('/getByCity', async function(req, res, next) {
  let connection = await createConnection();
  let city = req.query.city;
  let countQuery = `SELECT * FROM CHANNEL where city = ${city}`
  connection.query(countQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, channels: result});
  });
  
});

router.get('/getByNetwork', async function(req, res, next) {
  let connection = await createConnection();
  let network = req.query.network;
  let countQuery = `SELECT * FROM CHANNEL`
  connection.query(countQuery, function (err, result, fields) {
    if (err) {
      res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
    }
    res.status(200).json({ status: 200, channels: result});
  });
  
});

let validateChannel = async (channel) => {
  if(channel.state == undefined || channel.state == null || channel.state == ''){
    return false;
  }else if(channel.city == undefined || channel.city == null || channel.city == ''){
    return false;
  }else if(channel.name == undefined || channel.name == null || channel.name == ''){
    return false;
  }else if(channel.producer == undefined || channel.producer == null || channel.producer == ''){
    return false;
  }else{
    return true;
  }
}

router.post('/add', async function(req, res, next) {
  let connection = await createConnection();
  let channel = req.body;
  let validateData = await validateChannel(channel);
  console.log(validateData);
  if(validateData){
    let insertQuery = `INSERT INTO CHANNEL(name, state, city, producer) values ('${channel.name}', ${channel.state}, ${channel.city}, '${channel.producer}')`;
    connection.query(insertQuery, function (err, result, fields) {
      if (err) {
        res.status(500).json({status: 500, message: 'Something Went wrong. Please contact administrator'});
      }
      res.status(200).json({ status: 200, message: 'Channel Added Succussfully'});
    });
  }else{
    res.status(400).send('Please enter valid data to add channel');
  }
  
});



module.exports = router;